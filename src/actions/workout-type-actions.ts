import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import Lift from '../model/Lift';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import UserToLiftType from '../model/UserToLiftType';
import UserToWorkoutType from '../model/UserToWorkoutType';
import WorkoutType from '../model/WorkoutType';
import {IdMap} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';
import {Actions as LiftActions} from './lift-actions';
import {Actions as LiftTypeActions} from './lift-type-actions';
import {Actions as UserToLiftTypeActions} from './user-to-lift-type-actions';
import {Actions as UserToWorkoutTypeActions} from './user-to-workout-type-actions';

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

    let items: Array<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      items = (await apiService.getAsync<EntityType>(
                   `${controllerName}?$select=Name,Id
      &$expand=
        LiftTypes($select=Id,Name,Timed,WorkoutTypeId;$expand=
          UserToLiftTypes($select=Id,UserId,LiftTypeId;$filter=UserId eq ${userId})
          ,Lifts($orderby=StartDate desc;$top=1)
        )
        ,UserToWorkoutTypes($select=Id,WorkoutTypeId,LastCompletedDate;$filter=UserId eq ${userId})`,
                   ''))
                  .toList();
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
    const workoutTypes: IdMap<WorkoutType> = {};
    const liftTypes: IdMap<LiftType> = {};
    const lifts: IdMap<Lift> = {};
    const userToLiftTypes: IdMap<UserToLiftType> = {};
    const userToWorkoutTypes: IdMap<UserToWorkoutType> = {};
    items.forEach(workoutType => {
      workoutType.UserToWorkoutTypes.forEach((userToWorkoutType) => {
        userToWorkoutTypes[userToWorkoutType.WorkoutTypeId] = userToWorkoutType;
      });
      workoutType.LiftTypes.forEach((liftType) => {
        liftType.UserToLiftTypes.forEach((userToLiftType) => {
          userToLiftTypes[userToLiftType.Id] = userToLiftType;
        });
        liftType.Lifts.forEach((lift) => {
          lifts[lift.Id] = lift;
        });
        const strippedLiftType = {...liftType};
        strippedLiftType.Lifts = [];
        strippedLiftType.UserToLiftTypes = [];
        liftTypes[strippedLiftType.Id] = strippedLiftType;
      });
      const strippedworkoutType = {...workoutType};
      strippedworkoutType.UserToWorkoutTypes = [];
      strippedworkoutType.LiftTypes = [];
      workoutTypes[strippedworkoutType.Id] = strippedworkoutType;
    });
    dispatch(LiftActions.entitiesReceived(lifts));
    dispatch(LiftTypeActions.entitiesReceived(liftTypes));
    dispatch(UserToLiftTypeActions.entitiesReceived(userToLiftTypes));
    dispatch(UserToWorkoutTypeActions.entitiesReceived(userToWorkoutTypes));
    dispatch(Actions.entitiesReceived(workoutTypes));
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