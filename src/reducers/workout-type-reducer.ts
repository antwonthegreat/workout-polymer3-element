import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/workout-type-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {WorkoutTypeState} from '../model/state/WorkoutTypeState';
import WorkoutType from '../model/WorkoutType';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as WorkoutTypeState;

export const WorkoutTypeReducer: Reducer<WorkoutTypeState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      const list = action.payload as IdMap<WorkoutType>;
      return {...state, list};
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

export const getItems = (state: ApplicationState): IdMap<WorkoutType> => {
  if (!state.WorkoutTypeReducer)
    return {};

  return state.WorkoutTypeReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<WorkoutType>): Array<WorkoutType> => {
  return Object.values(items);
});