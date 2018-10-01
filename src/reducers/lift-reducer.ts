import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/lift-actions';
import Lift from '../model/Lift';
import {ApplicationState} from '../model/state/ApplicationState';
import {LiftState} from '../model/state/LiftState';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as LiftState;

export const LiftReducer: Reducer<LiftState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: action.payload};
    case actions.ENTITY_CREATED:
      return {...state, list: {...state.list, [action.payload.Id]: action.payload}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[action.payload]: value, ...updatedItems} = state.list;
      return {...state, list: updatedItems as any};
    default:
      return state;
  }
};

const getItems = (state: ApplicationState): IdMap<Lift> => {
  if (!state.LiftReducer)
    return {};

  return state.LiftReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<Lift>): Array<Lift> => {
  return Object.values(items);
});