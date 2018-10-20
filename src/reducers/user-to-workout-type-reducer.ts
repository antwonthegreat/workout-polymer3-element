import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/user-to-workout-type-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {UserToWorkoutTypeState} from '../model/state/UserToWorkoutTypeState';
import UserToWorkoutType from '../model/UserToWorkoutType';
import {IdMap} from '../services/action-helpers';

const initialState = {
  listByWorkoutTypeId: {}
} as UserToWorkoutTypeState;

export const UserToWorkoutTypeReducer: Reducer<UserToWorkoutTypeState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITY_CREATED:
      return {...state, list: {...state.listByWorkoutTypeId, [action.payload.WorkoutTypeId]: action.payload}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[action.payload]: value, ...updatedItems} = state.listByWorkoutTypeId;
      return {...state, list: updatedItems as any};
    default:
      return state;
  }
};

export const getItemsByWorkoutTypeId = (state: ApplicationState): IdMap<UserToWorkoutType> => {
  if (!state.UserToWorkoutTypeReducer)
    return {};

  return state.UserToWorkoutTypeReducer.listByWorkoutTypeId;
};

export const itemsByWorkoutTypesSelector = createSelector(getItemsByWorkoutTypeId, (items: IdMap<UserToWorkoutType>): IdMap<UserToWorkoutType> => {
  return items;
});