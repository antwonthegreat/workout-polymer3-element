import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import Lift from '../model/Lift';
import {ApplicationState} from '../model/state/ApplicationState';
import WorkoutSet from '../model/WorkoutSet';
import {IdMap} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';
import {Actions as LiftTypeActions} from './lift-type-actions';
import {updateLastCompletedDateAsync} from './user-to-workout-type-actions';
import {Actions as WorkoutSetActions} from './workout-set-actions';

type EntityType = Lift;
const entityName = 'Lift';
const controllerName = 'Lifts';

export const LIFT_CREATED = 'LIFT_CREATED';
export const ENTITY_DELETED = 'LIFT_DELETED';
export const ENTITIES_RECEIVED = 'LIFTS_RECEIVED';
export const SET_GRAPH_LIFT_TYPE_ID = 'SET_GRAPH_LIFT_TYPE_ID';

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(LIFT_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: IdMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
  setGraphLiftTypeId: (liftTypeId: number) => createAction(SET_GRAPH_LIFT_TYPE_ID, liftTypeId)
};

export const getItemsAsync = () => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    const state = getState();
    const userId = (state.AppReducer && state.AppReducer.userId);
    let items: Array<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      items = (await apiService.getAsync<EntityType>(`${controllerName}?$filter=Lift/Workout/UserId eq ${userId} $select=LiftTypeId,Id,StartDate,WorkoutId&$expand=WorkoutSets($select=Reps,Weight)`, '')).toList();
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
    const lifts: IdMap<Lift> = {};
    const workoutSets: IdMap<WorkoutSet> = {};
    items.forEach(lift => {
      lift.WorkoutSets.forEach(workoutSet => {
        workoutSets[workoutSet.Id] = {...workoutSet, LiftId: lift.Id, StartDate: workoutSet.StartDate === '0001-01-01T00:00:00Z' ? lift.StartDate : workoutSet.StartDate};
      });
      const strippedLift = {...lift};
      strippedLift.WorkoutSets = [];
      lifts[strippedLift.Id] = strippedLift;
    });
    dispatch(Actions.entitiesReceived(lifts));
    dispatch(WorkoutSetActions.entitiesReceived(workoutSets));
  };
};

export const getGraphDataAsync = (liftTypeId: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    const state = getState();
    const userId = (state.AppReducer && state.AppReducer.userId);
    let items: Array<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      // TODO: add friend's data
      items = (await apiService.getAsync<EntityType>(`${controllerName}?$filter=Workout/UserId eq ${userId} and LiftTypeId eq ${liftTypeId}&$select=LiftTypeId,Id,StartDate,WorkoutId&$expand=WorkoutSets($select=Reps,Weight,StartDate,LiftId,Id)`, '')).toList();
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
    const lifts: IdMap<Lift> = {};
    const workoutSets: IdMap<WorkoutSet> = {};
    items.forEach(lift => {
      lift.WorkoutSets.forEach((workoutSet) => {
        workoutSets[workoutSet.Id] = {...workoutSet, LiftId: lift.Id, StartDate: workoutSet.StartDate === '0001-01-01T00:00:00Z' ? lift.StartDate : workoutSet.StartDate};
      });
      const strippedLift = {...lift};
      strippedLift.WorkoutSets = [];
      lifts[strippedLift.Id] = strippedLift;
    });
    dispatch(Actions.setGraphLiftTypeId(liftTypeId));
    dispatch(Actions.entitiesReceived(lifts));
    dispatch(WorkoutSetActions.entitiesReceived(workoutSets));
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
    // check incomplete lts, update wt completed if necceccary

    // test user to lift type added
    // test user to lift ftype deleted
    dispatch(Actions.entityCreated(createdItem));
    if (liftType) {
      dispatch(LiftTypeActions.entityUpdated(liftType));
      dispatch(updateLastCompletedDateAsync(liftType.WorkoutTypeId));
    }
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