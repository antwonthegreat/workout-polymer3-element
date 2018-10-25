import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/lift-type-actions';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import {LiftTypeState} from '../model/state/LiftTypeState';
import {IdMap} from '../services/action-helpers';

import {getLastLiftCompletedDate} from './lift-reducer';
import {getItems as getUserToLiftTypes} from './user-to-lift-type-reducer';
import {itemsByWorkoutTypesSelector} from './user-to-workout-type-reducer';

const initialState = {
  selectedId: null,
  list: {}
} as LiftTypeState;

export const LiftTypeReducer: Reducer<LiftTypeState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      const list = action.payload as IdMap<LiftType>;
      return {...state, list: {...state.list, ...list}};
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

export const liftTypesSelector = createSelector(getItems, (items: IdMap<LiftType>): Array<LiftType> => {
  return Object.values(items);
});

export const activeItemsSelector = createSelector(liftTypesSelector, (items: Array<LiftType>): Array<LiftType> => {
  return items.filter(liftType => liftType.UserToLiftTypes && liftType.UserToLiftTypes.length > 0);
});

export const getActiveItems = (state: ApplicationState, workoutTypeId: number|null): Array<LiftType> => {
  const items = state.LiftTypeReducer ? state.LiftTypeReducer.list : {};
  const userToLiftTypes = getUserToLiftTypes(state);
  // console.log(`items, ${JSON.stringify(items)}`);
  // console.log(`utlts, ${JSON.stringify(userToLiftTypes)}`);
  return Object.values(items).filter(liftType => {
    const userToLiftType = Object.values(userToLiftTypes).filter(userToLiftType => userToLiftType.LiftTypeId === liftType.Id)[0];
    return userToLiftType && (!workoutTypeId || liftType.WorkoutTypeId === workoutTypeId);
  });
};

export const getIncompleteActiveItems = (state: ApplicationState, workoutTypeId: number|null): Array<LiftType> => {
  const allActiveItems = getActiveItems(state, workoutTypeId);
  return allActiveItems.filter(liftType => {
    const userToWorkoutType = itemsByWorkoutTypesSelector(state)[liftType.WorkoutTypeId];
    const workoutTypeLastCompletedDate = userToWorkoutType && userToWorkoutType.LastCompletedDate && new Date(userToWorkoutType.LastCompletedDate) || null;
    const liftTypeLastCompletedDate = getLastLiftCompletedDate(state, liftType.Id);
    // if (liftType.Id === 10)
    // console.log(liftTypeLastCompletedDate, workoutTypeLastCompletedDate);
    if (!workoutTypeLastCompletedDate && liftTypeLastCompletedDate)
      return false;

    if (!workoutTypeLastCompletedDate || !liftTypeLastCompletedDate)
      return true;

    return workoutTypeLastCompletedDate.getTime() > liftTypeLastCompletedDate.getTime();
  });
};

export const allActiveIncompleteItemsSelector = (state: ApplicationState, workoutTypeId: number|null, liftTypesAlreadyInWorkout: IdMap<LiftType>): Array<LiftType> => {
  let incompleteActiveItems = getIncompleteActiveItems(state, workoutTypeId);

  if (incompleteActiveItems.length < 1) {
    incompleteActiveItems = getActiveItems(state, workoutTypeId);
  }

  incompleteActiveItems = incompleteActiveItems.filter(liftType => !liftTypesAlreadyInWorkout[liftType.Id]);
  return incompleteActiveItems;
};

export const activeIncompleteItemSelector = (state: ApplicationState, workoutTypeId: number|null, liftTypesAlreadyInWorkout: IdMap<LiftType>, fallbackToComplete: boolean = true): LiftType|null => {
  let incompleteActiveItems = getIncompleteActiveItems(state, workoutTypeId);

  if (fallbackToComplete && incompleteActiveItems.length < 1)
    incompleteActiveItems = getActiveItems(state, workoutTypeId);

  incompleteActiveItems = incompleteActiveItems.filter(liftType => !liftTypesAlreadyInWorkout[liftType.Id]);
  if (incompleteActiveItems.length < 1)
    return null;  // Not enough active liftTypes to generate numberOfItems

  const index = Math.floor(Math.random() * (incompleteActiveItems.length));
  const item: LiftType = incompleteActiveItems[index];
  return item;
};