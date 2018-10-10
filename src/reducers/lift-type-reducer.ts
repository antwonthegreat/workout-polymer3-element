import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/lift-type-actions';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import {LiftTypeState} from '../model/state/LiftTypeState';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as LiftTypeState;

export const LiftTypeReducer: Reducer<LiftTypeState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITY_CREATED:
      return {...state, list: {...state.list, [action.payload.Id]: action.payload}};
    case actions.ENTITY_UPDATED:
      if (!action.payload.Id)
        return state;
      return {...state, list: {...state.list, [action.payload.Id]: {...state.list[action.payload.Id], ...action.payload}}};
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<LiftType> => {
  if (!state.LiftTypeReducer)
    return {};

  return state.LiftTypeReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<LiftType>): Array<LiftType> => {
  return Object.values(items);
});