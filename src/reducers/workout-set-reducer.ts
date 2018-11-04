import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/workout-set-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {WorkoutSetState} from '../model/state/WorkoutSetState';
import WorkoutSet from '../model/WorkoutSet';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as WorkoutSetState;

export const WorkoutSetReducer: Reducer<WorkoutSetState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: {...state.list, ...action.payload}};
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

export const getItems = (state: ApplicationState): IdMap<WorkoutSet> => {
  if (!state.WorkoutSetReducer)
    return {};

  return state.WorkoutSetReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<WorkoutSet>): Array<WorkoutSet> => {
  return Object.values(items);
});