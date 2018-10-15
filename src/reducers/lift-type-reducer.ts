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

export const activeItemsSelector = createSelector(itemsSelector, (items: Array<LiftType>): Array<LiftType> => {
  return items.filter(liftType => liftType.UserToLiftTypes && liftType.UserToLiftTypes.length > 0);
});

export const activeIncompleteItemsSelector = (state: ApplicationState, numberOfItems: number, workoutTypeId: number | null): Array<LiftType> =>  {
  const items = state.LiftTypeReducer  ? state.LiftTypeReducer.list : {};
  const allActiveItems: IdMap<LiftType> = Object.values(items).filter(liftType =>
    liftType.UserToLiftTypes &&
    liftType.UserToLiftTypes.length > 0
    && (!workoutTypeId || liftType.WorkoutTypeId === workoutTypeId)
  ).reduce((acc, liftType) => {
    return {...acc, [liftType.Id]: liftType};
  }, {});

  const incompleteActiveItems: IdMap<LiftType> = Object.values(items).filter(liftType =>
    liftType.UserToLiftTypes &&
    liftType.UserToLiftTypes.length > 0
    && (!workoutTypeId || liftType.WorkoutTypeId === workoutTypeId)
    //&& incomplete
  ).reduce((acc, liftType) => {
    return {...acc, [liftType.Id]: liftType};
  }, {});

  if (Object.keys(allActiveItems).length < numberOfItems)
    return Object.values(allActiveItems); //Not enough active liftTypes to generate numberOfItems

  const incompleteItems: Array<LiftType> = [];
  while (incompleteItems.length < numberOfItems && Object.keys(incompleteActiveItems).length > 0) {
    const index = Math.floor(Math.random() * (Object.keys(incompleteActiveItems).length));
    const item: LiftType = incompleteActiveItems[Object.keys(incompleteActiveItems)[index]];
    incompleteItems.push(item);
    delete incompleteActiveItems[item.Id];
    delete allActiveItems[item.Id];
  }

  while (incompleteItems.length < numberOfItems) {
    const index = Math.random() * (Object.keys(allActiveItems).length);
    const item: LiftType = allActiveItems[Object.keys(allActiveItems)[index]];
    incompleteItems.push(item);
    delete allActiveItems[item.Id];
  }

  return incompleteItems;
};