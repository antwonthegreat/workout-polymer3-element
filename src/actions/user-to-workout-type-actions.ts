import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
// import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import {ApplicationState} from '../model/state/ApplicationState';
import UserToWorkoutType from '../model/UserToWorkoutType';
import {activeIncompleteItemSelector} from '../reducers/lift-type-reducer';
// import {IdMap, toDictionary} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';

type EntityType = UserToWorkoutType;
const entityName = 'Completed Record';
const controllerName = 'UserToWorkoutTypes';

export const ENTITY_CREATED = 'USER_TO_WORKOUT_TYPE_CREATED';
export const ENTITY_DELETED = 'USER_TO_WORKOUT_TYPE_DELETED';
export const ENTITY_UPDATED = 'USER_TO_WORKOUT_TYPE_WORKOUT_UPDATED';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(ENTITY_CREATED, entity),
  entityDeleted: (workoutTypeId: number) => createAction(ENTITY_DELETED, workoutTypeId),
  entityUpdated: (entity: Partial<EntityType>) => createAction(ENTITY_UPDATED, entity)
};

export const createItemAsync = (item: Partial<EntityType>) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
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
  };
};

export const deleteItemAsync = (workoutTypeId: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    const state = getState();
    const id = state.UserToWorkoutTypeReducer && state.UserToWorkoutTypeReducer.listByWorkoutTypeId && state.UserToWorkoutTypeReducer.listByWorkoutTypeId[workoutTypeId] && state.UserToWorkoutTypeReducer.listByWorkoutTypeId[workoutTypeId].Id;
    if (!id)
      return;
    dispatch(AppActions.pageLoadingStarted());
    try {
      (await apiService.deleteAsync(`${controllerName}(${id})`, ''));
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    dispatch(Actions.entityDeleted(workoutTypeId));
  };
};

export const updateLastCompletedDateAsync = (workoutTypeId: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, _injected: ActionInjectable) => {
    const state = getState();
    const item = state.UserToWorkoutTypeReducer && state.UserToWorkoutTypeReducer.listByWorkoutTypeId && state.UserToWorkoutTypeReducer.listByWorkoutTypeId[workoutTypeId];
    if (activeIncompleteItemSelector(state, workoutTypeId) == null) {
      if (item) {
        let { WorkoutType, User, ...delta } = item;
        delta.LastCompletedDate = new Date().toISOString();
        dispatch(Actions.entityUpdated(delta));
      } else {
        dispatch(createItemAsync({ WorkoutTypeId: workoutTypeId, LastCompletedDate: new Date().toISOString()}));
      }
    }
  };
};

export type Actions = ActionsUnion<typeof Actions>;