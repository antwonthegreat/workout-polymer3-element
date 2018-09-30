import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import {ApplicationState} from '../model/state/ApplicationState';
import Workout from '../model/Workout';
import {IdMap, toDictionary} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';

type EntityType = Workout;
const entityName = 'WORKOUT';

export const ENTITY_CREATED = `${entityName}_CREATED`;
export const ENTITY_UPDATED = `${entityName}_UPDATED`;
export const ENTITY_DELETED = `${entityName}_DELETED`;
export const ENTITIES_RECEIVED = `${entityName}S_RECEIVED`;

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(ENTITY_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
  entityUpdated: (entity: Partial<EntityType>) => createAction(ENTITY_UPDATED, entity),
};

export const getItemsAsync = () => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    let items: StringMap<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      items = toDictionary((await apiService.getAsync<EntityType>(`Workouts?$select=Name,Id,StartDate&$expand=WorkoutType($select=Name),Lifts($expand=LiftType($select=Name))&$orderby=StartDate`, '')).toList());
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    if (!items)
      dispatch(AppActions.setSnackbarErrorMessage(`Error Getting ${entityName}s`));
    dispatch(Actions.entitiesReceived(items));
  };
};

export const createItemAsync = (item: Partial<EntityType>) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    let createdItem: EntityType|null;
    dispatch(AppActions.pageLoadingStarted());
    try {
      createdItem = (await apiService.postAsync<EntityType>('Workouts', item, ''));
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
      (await apiService.patchAsync(`Workouts(${id})`, item, ''));
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
      (await apiService.deleteAsync(`Workouts(${id})`, ''));
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