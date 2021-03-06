import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
// import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import {ApplicationState} from '../model/state/ApplicationState';
import UserToWorkoutType from '../model/UserToWorkoutType';
import {activeIncompleteItemSelector} from '../reducers/lift-type-reducer';
import {IdMap} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';

type EntityType = UserToWorkoutType;
const entityName = 'Completed Record';
const controllerName = 'UserToWorkoutTypes';

export const ENTITY_CREATED = 'USER_TO_WORKOUT_TYPE_CREATED';
export const ENTITY_DELETED = 'USER_TO_WORKOUT_TYPE_DELETED';
export const ENTITY_UPDATED = 'USER_TO_WORKOUT_TYPE_UPDATED';
export const ENTITIES_RECEIVED = 'USER_TO_WORKOUT_TYPES_RECEIVED';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(ENTITY_CREATED, entity),
  entityDeleted: (workoutTypeId: number) => createAction(ENTITY_DELETED, workoutTypeId),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
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

export const updateItemAsync = (id: number, item: Partial<EntityType>) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    dispatch(AppActions.pageLoadingStarted());
    let patchedItem: UserToWorkoutType|null = null;
    try {
      patchedItem = (await apiService.patchReturnDtoAsync<UserToWorkoutType>(`${controllerName}(${id})`, item, ''));
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    dispatch(Actions.entityUpdated({...patchedItem, Id: id}));
  };
};

export const updateLastCompletedDateAsync = (workoutTypeId: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, _injected: ActionInjectable) => {
    const state = getState();
    const item = state.UserToWorkoutTypeReducer && state.UserToWorkoutTypeReducer.listByWorkoutTypeId && state.UserToWorkoutTypeReducer.listByWorkoutTypeId[workoutTypeId];
    const activeIncompleteLiftType = activeIncompleteItemSelector(state, workoutTypeId, [], false);
    // console.log(activeIncompleteLiftType);
    if (activeIncompleteLiftType == null) {
      // console.log(`updateLastCompletedDateAsync`);
      // console.log(activeIncompleteItemSelector(state, workoutTypeId, []));
      if (item) {
        const delta = {LastCompletedDate: new Date().toISOString()};
        dispatch(updateItemAsync(item.Id, delta));
      } else {
        dispatch(createItemAsync({WorkoutTypeId: workoutTypeId, LastCompletedDate: new Date().toISOString()}));
      }
    }
  };
};

export type Actions = ActionsUnion<typeof Actions>;