import {Reducer} from 'redux';

import * as actions from '../actions/lift-actions';
import Lift from '../model/Lift';
import {ApplicationState} from '../model/state/ApplicationState';
import {LiftState} from '../model/state/LiftState';
import {getItems as getWorkoutSets} from '../reducers/workout-set-reducer';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
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
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<Lift> => {
  if (!state.LiftReducer)
    return {};

  return state.LiftReducer.list;
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