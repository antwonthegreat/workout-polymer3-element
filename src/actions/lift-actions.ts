import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import Lift from '../model/Lift';
import {ApplicationState} from '../model/state/ApplicationState';
import {IdMap, toDictionary} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';
import {Actions as LiftTypeActions} from './lift-type-actions';
import {updateLastCompletedDateAsync} from './user-to-workout-type-actions';

type EntityType = Lift;
const entityName = 'Lift';
const controllerName = 'Lifts';

export const LIFT_CREATED = 'LIFT_CREATED';
export const ENTITY_DELETED = 'LIFT_DELETED';
export const ENTITIES_RECEIVED = 'LIFTS_RECEIVED';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(LIFT_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message)
};

export const getItemsAsync = () => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();

    let items: StringMap<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      items = toDictionary((await apiService.getAsync<EntityType>(`${controllerName}?$select=LiftTypeId,Id,StartDate,WorkoutId&$expand=WorkoutSets($select=Reps,Weight)`, '')).toList());
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    if (!items) {
      dispatch(AppActions.setSnackbarErrorMessage(`Error Getting ${entityName}s`));
      return;
    }
    dispatch(Actions.entitiesReceived(items));
  };
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
    createdItem.WorkoutSets = [];
    const state = getState();
    const liftType = state.LiftTypeReducer && state.LiftTypeReducer.list && state.LiftTypeReducer.list[createdItem.LiftTypeId];
    if (liftType) {
      dispatch(LiftTypeActions.entityUpdated(liftType));
      dispatch(updateLastCompletedDateAsync(liftType.WorkoutTypeId));
    }
    // check incomplete lts, update wt completed if necceccary

    // test user to lift type added
    // test user to lift ftype deleted
    dispatch(Actions.entityCreated(createdItem));
  };
};

export const deleteItemAsync = (id: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
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
  };
};

export type Actions = ActionsUnion<typeof Actions>;