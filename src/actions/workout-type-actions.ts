import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import {ApplicationState} from '../model/state/ApplicationState';
import WorkoutType from '../model/WorkoutType';
import {IdMap, toDictionary} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';

type EntityType = WorkoutType;
const entityName = 'WORKOUT_TYPE';
const controllerName = 'WorkoutTypes';

export const ENTITY_CREATED = 'WORKOUT_TYPE_CREATED';
export const ENTITY_UPDATED = 'WORKOUT_TYPE_UPDATED';
export const ENTITY_DELETED = 'WORKOUT_TYPE_DELETED';
export const ENTITIES_RECEIVED = 'WORKOUT_TYPES_RECEIVED';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(ENTITY_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
  entityUpdated: (entity: Partial<EntityType>) => createAction(ENTITY_UPDATED, entity),
};

export const getItemsAsync = () => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    const appState = _getState().AppReducer;
    // TODO: remove default once authorization works
    const userId = (appState && appState.userId) || 1;

    let items: StringMap<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      items = toDictionary((await apiService.getAsync<EntityType>(
                                `${controllerName}?$select=Name,Id
      &$expand=
        LiftTypes($select=Name,Timed,WorkoutTypeId;$expand=
          UserToLiftTypes($select=UserId;$filter=UserId eq ${userId}))
          ,Lifts($orderby=StartDate desc,$top=1)
        ,UserToWorkoutTypes($select=Id,WorkoutTypeId,LastCompletedDate;$filter=UserId eq ${userId})`,
                                ''))
                               .toList());
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