import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import {ApplicationState} from '../model/state/ApplicationState';
import Workout from '../model/Workout';
import {IdMap, toDictionary} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';

type EntityType = Workout;
const entityName = 'Workout';

export const WORKOUT_CREATED = 'WORKOUT_CREATED';
export const ENTITY_UPDATED = 'WORKOUT_UPDATED';
export const ENTITY_DELETED = 'WORKOUT_DELETED';
export const ENTITIES_RECEIVED = 'WORKOUTS_RECEIVED';
export const ENTITY_SELECTED = 'WORKOUT_SELECTED';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(WORKOUT_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
  entityUpdated: (entity: Partial<EntityType>) => createAction(ENTITY_UPDATED, entity),
  entitySelected: (id: number) => createAction(ENTITY_SELECTED, id),
};

export const getItemsAsync = () => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    let items: StringMap<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      items = toDictionary((await apiService.getAsync<EntityType>(`Workouts?$select=Name,Id,StartDate&$expand=Lifts($expand=LiftType($select=Name))&$orderby=StartDate desc&$top=50`, '')).toList());
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

export const getItemIfNeededAsync = (id: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const state = getState();
    if (state.WorkoutReducer && state.WorkoutReducer.list[id] && (state.WorkoutReducer.list[id].Lifts.length === 0 || state.WorkoutReducer.list[id].Lifts[0].WorkoutSets)) {
      dispatch(AppActions.navigate(`/user/workout/${id}`));
      return;
    }
    const apiService = injected.apiServiceFactory.create();
    let item: EntityType|null;
    dispatch(AppActions.pageLoadingStarted());
    try {
      item = (await apiService.getAsync<EntityType>(`Workouts?$filter=Id eq ${id}&$select=Name,Id,StartDate&$expand=Lifts($expand=LiftType($select=Name))&$top=1`, '')).firstOrDefault();
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    if (!item) {
      dispatch(AppActions.setSnackbarErrorMessage(`Error Getting ${entityName}`));
      return;
    }
    dispatch(Actions.entityUpdated({...item, Id: id}));
    dispatch(AppActions.navigate(`/user/workout/${id}`));
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
    createdItem.Lifts = [];
    dispatch(Actions.entityCreated(createdItem));
    dispatch(getItemIfNeededAsync(createdItem.Id));
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