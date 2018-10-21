import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/workout-actions';
import Lift from '../model/Lift';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import {WorkoutState} from '../model/state/WorkoutState';
import Workout from '../model/Workout';
import {IdMap} from '../services/action-helpers';

import {getItems as getLifts} from './lift-reducer';
import {getItems as getLiftTypes} from './lift-type-reducer';

const initialState = {
  selectedId: null,
  list: {}
} as WorkoutState;

export const WorkoutReducer: Reducer<WorkoutState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: {...state.list, ...action.payload}};
    case actions.WORKOUT_CREATED:
      return {...state, list: {...state.list, [action.payload.Id]: action.payload}};
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
    };
  });
});

export const selectedItemSelector = createSelector(getItems, getSelectedId, (items: IdMap<Workout>, selectedId: number): Workout|null => {
  return selectedId ? items[selectedId] : null;
});