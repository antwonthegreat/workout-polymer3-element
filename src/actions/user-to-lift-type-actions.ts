import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
// import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import {ApplicationState} from '../model/state/ApplicationState';
import UserToLiftType from '../model/UserToLiftType';

import {IdMap} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';
import {updateLastCompletedDateAsync} from './user-to-workout-type-actions';

type EntityType = UserToLiftType;
const entityName = 'Lift';
const controllerName = 'UserToLiftTypes';

export const ENTITY_CREATED = 'USER_TO_LIFT_TYPE_CREATED';
export const ENTITY_DELETED = 'USER_TO_LIFT_TYPE_DELETED';
export const ENTITIES_RECEIVED = 'USER_TO_LIFT_TYPES_RECEIVED';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(ENTITY_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
};

export const createItemAsync = (item: Partial<EntityType>) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    let createdItem: EntityType|null;
    dispatch(AppActions.pageLoadingStarted());
    try {
      createdItem = (await apiService.postAsync<EntityType>(controllerName, item, ''));
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    if (!createdItem) {
      dispatch(AppActions.setSnackbarErrorMessage(`Error Creating ${entityName}`));
      return;
    }
    dispatch(Actions.entityCreated(createdItem));
    const state = getState();
    const workoutTypeId = state.LiftTypeReducer && state.LiftTypeReducer.list[createdItem.LiftTypeId] && state.LiftTypeReducer.list[createdItem.LiftTypeId].WorkoutTypeId;
    if (workoutTypeId)
      dispatch(updateLastCompletedDateAsync(workoutTypeId));
  };
};

export const deleteItemAsync = (id: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    dispatch(AppActions.pageLoadingStarted());
    try {
      (await apiService.deleteAsync(`${controllerName}(${id})`, ''));
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    dispatch(Actions.entityDeleted(id));
    const state = getState();
    const workoutTypeId = state.UserToLiftTypeReducer && state.UserToLiftTypeReducer.list[id] && state.LiftTypeReducer && state.LiftTypeReducer.list[state.UserToLiftTypeReducer.list[id].LiftTypeId] && state.LiftTypeReducer.list[state.UserToLiftTypeReducer.list[id].LiftTypeId].WorkoutTypeId;
    if (workoutTypeId)
      dispatch(updateLastCompletedDateAsync(workoutTypeId));
  };
};

export type Actions = ActionsUnion<typeof Actions>;