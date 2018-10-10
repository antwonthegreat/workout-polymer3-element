import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/user-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {UserState} from '../model/state/UserState';
import User from '../model/User';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as UserState;

export const UserReducer: Reducer<UserState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: action.payload};
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<User> => {
  if (!state.UserReducer)
    return {};

  return state.UserReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<User>): Array<User> => {
  return Object.values(items);
});