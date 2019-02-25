import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/lift-actions';
import Lift from '../model/Lift';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import {LiftState} from '../model/state/LiftState';
import WorkoutSet from '../model/WorkoutSet';
import {getItems as getLiftTypes} from '../reducers/lift-type-reducer';
import {getItems as getWorkoutSets} from '../reducers/workout-set-reducer';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {},
  graphLiftTypeId: null
} as LiftState;

export const LiftReducer: Reducer<LiftState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: {...state.list, ...action.payload}};
    case actions.LIFT_CREATED:
      return {...state, list: {...state.list, [action.payload.Id]: action.payload}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[action.payload]: value, ...updatedItems} = state.list;
      return {...state, list: updatedItems as any};
    case actions.SET_GRAPH_LIFT_TYPE_ID:
      return {...state, graphLiftTypeId: action.payload};
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<Lift> => {
  if (!state.LiftReducer)
    return {};

  return state.LiftReducer.list;
};

export const getGraphLiftTypeId = (state: ApplicationState): number|null => {
  if (!state.LiftReducer)
    return null;

  return state.LiftReducer.graphLiftTypeId;
};

export const getLastLiftCompletedWithSets = (state: ApplicationState, liftTypeId: number, completedBefore: string): Lift|null => {
  const lifts = state.LiftReducer && state.LiftReducer.list || {};

  const workoutsSetDictionary = getWorkoutSets(state);

  const lastLift: null|Lift = Object.keys(lifts).reduce((lastLift: null|Lift, key) => {
    const lift: Lift = lifts[key];
    const workoutSets = Object.values(workoutsSetDictionary).filter(workoutSet => workoutSet.LiftId === lift.Id);
    if (lift.LiftTypeId !== liftTypeId || workoutSets.length === 0 || !completedBefore || new Date(lift.StartDate).getTime() >= new Date(completedBefore).getTime())
      return lastLift;

    const lastLiftMilliseconds = lastLift ? new Date(lastLift.StartDate).getTime() : 0;
    const liftMilliseconds = new Date(lift.StartDate).getTime();

    return lastLiftMilliseconds > liftMilliseconds ? lastLift : {...lift, WorkoutSets: workoutSets};
  }, null);

  return lastLift;
};

export const getLastLiftCompletedDate = (state: ApplicationState, liftTypeId: number): Date|null => {
  const lifts = state.LiftReducer && state.LiftReducer.list || {};

  const newestMilliseconds: null|number = Object.keys(lifts).reduce((newestMilliseconds, key) => {
    const lift: Lift = lifts[key];
    if (lift.LiftTypeId !== liftTypeId)
      return newestMilliseconds;
    const liftMilliseconds = new Date(lift.StartDate).getTime();
    return Math.max(newestMilliseconds || 0, liftMilliseconds);
  }, null);

  return newestMilliseconds ? new Date(newestMilliseconds) : null;
};

export const graphDataSelector = createSelector(getItems, getWorkoutSets, getLiftTypes, getGraphLiftTypeId, (items: IdMap<Lift>, workoutSets: IdMap<WorkoutSet>, liftTypes: IdMap<LiftType>, graphLiftTypeId: number|null): GraphData => {
  const lifts = Object.values(items)
                    .filter(lift => lift.LiftTypeId === graphLiftTypeId)
                    // .sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime())
                    .sort((a, b) => a.Id - b.Id)
                    .map(lift => {
                      return {
                        ...lift,
                        WorkoutSets: Object.values(workoutSets)
                                         .filter((workoutSet: WorkoutSet) => workoutSet.LiftId === lift.Id)
                                         // .sort((a: WorkoutSet, b: WorkoutSet) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())
                                         .sort((a: WorkoutSet, b: WorkoutSet) => a.Id - b.Id)
                      };
                    });
  const userWorkoutSetCollection: UserWorkoutSetCollection = {normalSets: [], oneRepMaxSets: [], pyramidSets: [], ascendingPyramidSets: [], descendingPyramidSets: []};
  lifts.forEach(lift => {
    if (lift.WorkoutSets.length === 0) {
      return;
    }

    if (lift.WorkoutSets.every(workoutSet => workoutSet.Reps === 1)) {
      userWorkoutSetCollection.oneRepMaxSets.push(lift.WorkoutSets);
      return;
    }

    let ascendCount = 0;
    let descendCount = 0;
    let isNotAPyramid = lift.WorkoutSets.length < 3;
    let lastWeight: number|null = null;

    lift.WorkoutSets.forEach(workoutSet => {
      if (lastWeight !== null) {
        if (workoutSet.Weight === lastWeight)
          isNotAPyramid = true;

        if (workoutSet.Weight > lastWeight) {
          ascendCount++;
          if (descendCount > 0)
            isNotAPyramid = true;
        }

        if (workoutSet.Weight < lastWeight)
          descendCount++;
      }
      lastWeight = workoutSet.Weight;
    });

    if (isNotAPyramid) {
      userWorkoutSetCollection.normalSets.push(lift.WorkoutSets);
    } else if (ascendCount > 0 && descendCount > 0) {
      userWorkoutSetCollection.pyramidSets.push(lift.WorkoutSets);
    } else if (ascendCount === 0 && descendCount > 0) {
      userWorkoutSetCollection.descendingPyramidSets.push(lift.WorkoutSets);
    } else if (ascendCount > 0 && descendCount === 0) {
      userWorkoutSetCollection.ascendingPyramidSets.push(lift.WorkoutSets);
    } else {
      console.warn(`warn`, lift);
    }
  });
  const liftTypeName = graphLiftTypeId && liftTypes[graphLiftTypeId] ? liftTypes[graphLiftTypeId].Name : '';
  return {userWorkoutSetCollections: [userWorkoutSetCollection], liftTypeName};
});

interface GraphData {
  liftTypeName: string;
  userWorkoutSetCollections: Array<UserWorkoutSetCollection>;
}

export interface UserWorkoutSetCollection {
  oneRepMaxSets: Array<Array<WorkoutSet>>;
  pyramidSets: Array<Array<WorkoutSet>>;
  normalSets: Array<Array<WorkoutSet>>;
  ascendingPyramidSets: Array<Array<WorkoutSet>>;
  descendingPyramidSets: Array<Array<WorkoutSet>>;
}