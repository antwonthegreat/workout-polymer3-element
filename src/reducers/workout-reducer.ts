import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/workout-actions';
import Lift from '../model/Lift';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import {WorkoutState} from '../model/state/WorkoutState';
import Workout from '../model/Workout';
import WorkoutSet from '../model/WorkoutSet';
import {IdMap} from '../services/action-helpers';

import {getItems as getLifts} from './lift-reducer';
import {getItems as getLiftTypes} from './lift-type-reducer';
import {getItems as getWorkoutSets} from './workout-set-reducer';

const initialState = {
  selectedId: null,
  list: {},
  pageCount: 0,
  totalCount: null,
  skipAmount: 20,
  skipOffset: 0
} as WorkoutState;

export const WorkoutReducer: Reducer<WorkoutState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, pageCount: (state.pageCount || 0) + 1, totalCount: action.payload.totalCount, list: {...state.list, ...action.payload.items}};
    case actions.WORKOUT_CREATED:
      return {...state, skipOffset: state.skipOffset + 1, list: {...state.list, [action.payload.Id]: action.payload}};
    case actions.ENTITY_UPDATED:
      if (!action.payload.Id)
        return state;
      return {...state, list: {...state.list, [action.payload.Id]: {...state.list[action.payload.Id], ...action.payload}}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[action.payload]: value, ...updatedItems} = state.list;
      return {...state, list: updatedItems as any};
    case actions.ENTITY_SELECTED:
      return {...state, selectedId: action.payload};
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<Workout> => {
  if (!state.WorkoutReducer)
    return {};

  return state.WorkoutReducer.list;
};

export const getSelectedId = (state: ApplicationState): null|number => {
  if (!state.WorkoutReducer || !state.WorkoutReducer.selectedId)
    return null;

  return state.WorkoutReducer.selectedId;
};

export const workoutWithLiftsWithLiftTypeSelector = createSelector(getItems, getLifts, getLiftTypes, (items: IdMap<Workout>, lifts: IdMap<Lift>, liftTypes: IdMap<LiftType>): Array<Workout> => {
  return Object.values(items).sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime()).map(workout => {
    return {
      ...workout,
      Lifts: Object.keys(lifts)
                 .map(key => {
                   return {...lifts[key], LiftType: liftTypes[lifts[key].LiftTypeId]};
                 })
                 .filter((lift: Lift) => lift.WorkoutId === workout.Id)
                 .sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())
    };
  });
});

// TODO: save as template

export const selectedItemWithLiftsWithLiftTypeAndWorkoutSetsSelector = createSelector(getItems, getLifts, getLiftTypes, getSelectedId, getWorkoutSets, (items: IdMap<Workout>, lifts: IdMap<Lift>, liftTypes: IdMap<LiftType>, selectedId: number, workoutSets: IdMap<WorkoutSet>): Workout|null => {
  if (!selectedId)
    return null;
  const workout = items[selectedId];
  if (!workout)
    return null;
  return {
    ...workout,
    Lifts: Object.keys(lifts)
               .map(key => {
                 const sets = Object.values(workoutSets).filter(workoutSet => workoutSet.LiftId === lifts[key].Id);
                 return {...lifts[key], LiftType: liftTypes[lifts[key].LiftTypeId], WorkoutSets: sets};
               })
               .filter((lift: Lift) => lift.WorkoutId === workout.Id)
               .sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime())
  };
});