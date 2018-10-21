import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/user-to-lift-type-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {UserToLiftTypeState} from '../model/state/UserToLiftTypeState';
import UserToLiftType from '../model/UserToLiftType';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as UserToLiftTypeState;

export const UserToLiftTypeReducer: Reducer<UserToLiftTypeState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: {...state.list, ...action.payload}};
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

export const getItems = (state: ApplicationState): IdMap<UserToLiftType> => {
  if (!state.UserToLiftTypeReducer)
    return {};

  return state.UserToLiftTypeReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<UserToLiftType>): Array<UserToLiftType> => {
  return Object.values(items);
});