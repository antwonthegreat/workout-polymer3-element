import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/lift-actions';
import Lift from '../model/Lift';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import {LiftState} from '../model/state/LiftState';
import {IdMap} from '../services/action-helpers';
import {getItems as getLiftTypes} from './lift-type-reducer';

const initialState = {
  selectedId: null,
  list: {}
} as LiftState;

export const LiftReducer: Reducer<LiftState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      return {...state, list: {...state.list, ...action.payload}};
    case actions.LIFT_CREATED:
      return {...state, list: {...state.list, [action.payload.Id]: action.payload}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[action.payload]: value, ...updatedItems} = state.list;
      return {...state, list: updatedItems as any};
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<Lift> => {
  if (!state.LiftReducer)
    return {};

  return state.LiftReducer.list;
};

export const liftsWithLiftTypeSelector = createSelector(getItems, getLiftTypes, (items: IdMap<Lift>, liftTypes: IdMap<LiftType>): Array<Lift> => {
  return Object.values(items).map(lift => {
    return {...lift, LiftType: liftTypes[lift.LiftTypeId] || null};
  });
});

export const getLastLiftCompletedDate = (state: ApplicationState, liftTypeId: number): Date|null => {
  const lifts = state.LiftReducer && state.LiftReducer.list || {};

  const newestMilliseconds: null|number = Object.keys(lifts).reduce((newestMilliseconds, key) => {
    const lift: Lift = lifts[key];
    if (lift.LiftTypeId !== liftTypeId)
      return newestMilliseconds;
    const liftMilliseconds = new Date(lift.StartDate).getTime();
    return Math.max(newestMilliseconds || 0, liftMilliseconds);
  }, null);

  return newestMilliseconds ? new Date(newestMilliseconds) : null;
};