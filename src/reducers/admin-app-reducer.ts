import {Reducer} from 'redux';

import * as adminActions from '../actions/admin-app-actions';
import {AdminState} from '../model/state/AdminState';

const initialState = {
  selectedProducer: null,
} as AdminState;

export const reducer: Reducer<AdminState> = (state = initialState, action: adminActions.Actions) => {
  switch (action.type) {
    case adminActions.SET_SELECTED_PRODUCER:
      return {...state, selectedProducer: action.payload};
    default:
      return state;
  }
};
export {reducer as adminAppReducer};