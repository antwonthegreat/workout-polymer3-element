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
    case actions.ENTITY_CREATED:
      return {...state, list: {...state.list, [action.payload.Id]: action.payload}};
    case actions.ENTITY_UPDATED:
      if (!action.payload.Id)
        return state;
      return {...state, list: {...state.list, [action.payload.Id]: {...state.list[action.payload.Id], ...action.payload}}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[action.payload]: value, ...updatedItems} = state.list;
      return {...state, list: updatedItems as any};
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<Workout> => {
  if (!state.WorkoutReducer)
    return {};

  return state.WorkoutReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<Workout>): Array<Workout> => {
  return Object.values(items);
});
