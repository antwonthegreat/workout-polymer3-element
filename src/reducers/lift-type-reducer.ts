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

const getLastWorkoutTypeCompletedDate = (state: ApplicationState, workoutTypeId: number): Date|null => {
  const workoutTypeList = state.WorkoutTypeReducer  ? state.WorkoutTypeReducer.list : {};
  const workoutType = workoutTypeList[workoutTypeId];
  if (!workoutType)
    return null;
  const lastCompletedDate = workoutType.UserToWorkoutTypes && workoutType.UserToWorkoutTypes.length ? workoutType.UserToWorkoutTypes[0].LastCompletedDate  : null;
  return lastCompletedDate ? new Date(lastCompletedDate) : null;
};

const getLastLiftTypeCompletedDate = (liftType: LiftType): Date|null => {
  const lastLift = liftType.Lifts && liftType.Lifts.length && liftType.Lifts[0];
  if (!lastLift)
    return null;
  return new Date(lastLift.StartDate);
};

export const activeIncompleteItemsSelector = (state: ApplicationState, workoutTypeId: number | null): LiftType|null =>  {
  const items = state.LiftTypeReducer  ? state.LiftTypeReducer.list : {};

  const allActiveItems = Object.values(items).filter(liftType =>
    liftType.UserToLiftTypes &&
    liftType.UserToLiftTypes.length > 0
    && (!workoutTypeId || liftType.WorkoutTypeId === workoutTypeId)
  );

  let incompleteActiveItems = allActiveItems.filter(liftType => {
    const workoutTypeLastCompletedDate = getLastWorkoutTypeCompletedDate(state, liftType.WorkoutTypeId);
    const liftTypeLastCompletedDate = getLastLiftTypeCompletedDate(liftType);

    if (!workoutTypeLastCompletedDate || !liftTypeLastCompletedDate)
      return true;

    return workoutTypeLastCompletedDate.getTime() > liftTypeLastCompletedDate.getTime();
  });

  if (incompleteActiveItems.length < 1)
    incompleteActiveItems = allActiveItems;

  if (incompleteActiveItems.length < 1)
    return null; //Not enough active liftTypes to generate numberOfItems

  const index = Math.floor(Math.random() * (incompleteActiveItems.length));
  const item: LiftType = incompleteActiveItems[index];
  return item;
};