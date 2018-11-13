import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {ThunkDispatch} from 'redux-thunk';

import {Actions as LiftActions} from '../actions/lift-actions';
import {ActionInjectable} from '../model/ActionInjectable';
import {ApplicationState} from '../model/state/ApplicationState';
import WorkoutSet from '../model/WorkoutSet';
import {IdMap} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';

type EntityType = WorkoutSet;
const entityName = 'Set';
const controllerName = 'WorkoutSets';

export const ENTITY_CREATED = 'WORKOUT_SET_CREATED';
export const ENTITY_UPDATED = 'WORKOUT_SET_UPDATED';
export const ENTITY_DELETED = 'WORKOUT_SET_DELETED';
export const ENTITIES_RECEIVED = 'WORKOUT_SETS_RECEIVED';
export const PERSONAL_BEST_RECEIVED = 'PERSONAL_BEST_RECEIVED';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(ENTITY_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
  entityUpdated: (entity: Partial<EntityType>) => createAction(ENTITY_UPDATED, entity),
  personalBestRecieved: (p: {entity: EntityType|null, liftTypeId: number}) => createAction(PERSONAL_BEST_RECEIVED, p)
};

export const getPersonalBestAsync = (liftTypeId: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    const state = getState();
    const appState = state.AppReducer;
    if (state.WorkoutSetReducer && state.WorkoutSetReducer.personalBestByLiftTypeId && state.WorkoutSetReducer.personalBestByLiftTypeId[liftTypeId] !== undefined)
      return;

    const userId = (appState && appState.userId) || 0;

    let item: EntityType|null;
    dispatch(AppActions.pageLoadingStarted());
    try {
      item = (await apiService.getAsync<EntityType>(`${controllerName}?$expand=Lift&$filter=Lift/Workout/UserId eq ${userId} and Lift/LiftTypeId eq ${liftTypeId}&orderby=Weight desc,Reps desc`, '')).firstOrDefault();
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    dispatch(Actions.personalBestRecieved({entity: item || null, liftTypeId}));
    if (item) {
      dispatch(LiftActions.entitiesReceived({[item.Lift.Id]: item.Lift}));
      dispatch(Actions.entitiesReceived({[item.Id]: item}));
    }
  };
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

export const updateItemAsync = (id: number, item: Partial<EntityType>) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    dispatch(AppActions.pageLoadingStarted());
    try {
      (await apiService.patchAsync(`${controllerName}(${id})`, item, ''));
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    dispatch(Actions.entityUpdated({...item, Id: id}));
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