import {GetResult} from '@leavittsoftware/api-service/lib/get-result';
import {Action, ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {ThunkDispatch} from 'redux-thunk';

import {ActionInjectable} from '../model/ActionInjectable';
import Lift from '../model/Lift';
import {ApplicationState} from '../model/state/ApplicationState';
import Workout from '../model/Workout';
import WorkoutSet from '../model/WorkoutSet';
import WorkoutType from '../model/WorkoutType';
import {getItems as getLiftTypes} from '../reducers/lift-type-reducer';
import {IdMap} from '../services/action-helpers';

import {Actions as AppActions} from './app-actions';
import {Actions as LiftActions} from './lift-actions';
import {updateLastCompletedDateAsync} from './user-to-workout-type-actions';
import {Actions as WorkoutSetActions, getPersonalBestAsync} from './workout-set-actions';

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
  entitiesReceived: (message: {items: IdMap<EntityType>, totalCount: number}) => createAction(ENTITIES_RECEIVED, message),
  entityUpdated: (entity: Partial<EntityType>) => createAction(ENTITY_UPDATED, entity),
  entitySelected: (id: number) => createAction(ENTITY_SELECTED, id),
};

export const selectEntityAsync = (id: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, _injected: ActionInjectable) => {
    dispatch(getItemExpandedIfNeededAsync(id));
    dispatch(Actions.entitySelected(id));
  };
};

// store total count in state, increment on create
// store page count in state
// skip
export const getPagedItemsAsync = () => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    let items: Array<EntityType>;
    let result: GetResult<EntityType>;
    const state = getState();
    const userId = (state.AppReducer && state.AppReducer.userId);
    const pageCount = (state.WorkoutReducer && state.WorkoutReducer.pageCount) || 0;
    const skipAmount = (state.WorkoutReducer && state.WorkoutReducer.skipAmount) || 20;
    const skipOffset = (state.WorkoutReducer && state.WorkoutReducer.skipOffset) || 0;
    const totalCount = (state.WorkoutReducer && state.WorkoutReducer.totalCount) || null;
    const skip = pageCount * skipAmount + skipOffset;
    if ((totalCount !== null && skip >= totalCount) || !userId) {
      return;
    }
    dispatch(AppActions.pageLoadingStarted());
    try {
      result = await apiService.getAsync<EntityType>(
          `Workouts?
        $select=Name,Id,StartDate
        &$filter=UserId eq ${userId}
        &$expand=Lifts&$orderby=StartDate desc&$skip=${skip}
        &$top=${skipAmount}
        &$count=true`,
          '');
      items = result.toList();
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
    const workouts: IdMap<Workout> = {};
    items.forEach(workout => {
      workout.Lifts.forEach(lift => {
        lifts[lift.Id] = lift;
      });
      const strippedWorkout = {...workout};
      strippedWorkout.Lifts = [];
      workouts[strippedWorkout.Id] = strippedWorkout;
    });
    dispatch(Actions.entitiesReceived({items: workouts, totalCount: result.odataCount}));
    dispatch(LiftActions.entitiesReceived(lifts));
  };
};

export const getItemExpandedIfNeededAsync = (id: number) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
    const state = getState();
    if (state.WorkoutReducer && state.WorkoutReducer.list[id] && state.WorkoutReducer.list[id].expanded) {
      dispatch(AppActions.navigate(`/user/workout/${id}`));
      return;
    }
    const apiService = injected.apiServiceFactory.create();
    // TODO: remove default once authorization works
    const userId = (state.AppReducer && state.AppReducer.userId);
    let item: EntityType|null;
    dispatch(AppActions.pageLoadingStarted());
    try {
      item = (await apiService.getAsync<EntityType>(`Workouts?$filter=Id eq ${id}&$select=Name,Id,StartDate&$expand=Lifts($expand=WorkoutSets,LiftType($expand=Lifts($filter=Workout/UserId eq ${userId} and WorkoutSets/any(workoutSet:workoutSet/Reps gt 0);$expand=WorkoutSets;$top=1)))&$top=1`, '')).firstOrDefault();
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
    const lifts: IdMap<Lift> = {};
    const workoutSets: IdMap<WorkoutSet> = {};
    item.Lifts.forEach(lift => {
      dispatch(getPersonalBestAsync(lift.LiftTypeId));
      lifts[lift.Id] = {...lift, WorkoutSets: []};
      lift.WorkoutSets.forEach(workoutSet => {
        workoutSets[workoutSet.Id] = {...workoutSet, LiftId: lift.Id, StartDate: workoutSet.StartDate === '0001-01-01T00:00:00Z' ? lift.StartDate : workoutSet.StartDate};
      });
    });
    const strippedWorkout = {...item};
    strippedWorkout.Lifts = [];

    dispatch(LiftActions.entitiesReceived(lifts));
    dispatch(WorkoutSetActions.entitiesReceived(workoutSets));
    dispatch(Actions.entityUpdated({...item, Id: id, expanded: true}));
    dispatch(AppActions.navigate(`/user/workout/${id}`));
  };
};

export const createItemAsync = (item: Partial<EntityType>) => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, getState: () => ApplicationState, injected: ActionInjectable) => {
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

    if (item.Lifts && item.Lifts.length) {
      const workoutTypesToUpdate: IdMap<WorkoutType> = item.Lifts.reduce((acc: IdMap<WorkoutType>, lift) => {
        const liftType = getLiftTypes(getState())[lift.LiftTypeId];
        if (liftType)
          acc[liftType.WorkoutTypeId] = {} as WorkoutType;
        return acc;
      }, {});
      Object.keys(workoutTypesToUpdate).forEach(workoutTypeId => {
        dispatch(updateLastCompletedDateAsync(parseInt(workoutTypeId)));
      });
    }

    createdItem.Lifts = [];
    dispatch(Actions.entityCreated(createdItem));
    dispatch(getItemExpandedIfNeededAsync(createdItem.Id));
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