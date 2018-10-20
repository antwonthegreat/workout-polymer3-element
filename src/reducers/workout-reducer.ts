import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/workout-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {WorkoutState} from '../model/state/WorkoutState';
import Workout from '../model/Workout';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as WorkoutState;

export const WorkoutReducer: Reducer<WorkoutState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: action.payload};
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

export const itemsSelector = createSelector(getItems, (items: IdMap<Workout>): Array<Workout> => {
  return Object.values(items).sort((a, b) => new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime());
});

export const selectedItemSelector = createSelector(getItems, getSelectedId, (items: IdMap<Workout>, selectedId: number): Workout|null => {
  return selectedId ? items[selectedId] : null;
});