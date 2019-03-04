import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/workout-type-actions';
import LiftType from '../model/LiftType';
import {ApplicationState} from '../model/state/ApplicationState';
import {WorkoutTypeState} from '../model/state/WorkoutTypeState';
import UserToLiftType from '../model/UserToLiftType';
import UserToWorkoutType from '../model/UserToWorkoutType';
import WorkoutType from '../model/WorkoutType';
import {IdMap} from '../services/action-helpers';

import {getItems as getLiftTypes} from './lift-type-reducer';
import {getItems as getUserToLiftTypes} from './user-to-lift-type-reducer';
import {getItemsByWorkoutTypeId as getUserToWorkoutTypes} from './user-to-workout-type-reducer';

const initialState = {
  selectedId: null,
  list: {}
} as WorkoutTypeState;

export const WorkoutTypeReducer: Reducer<WorkoutTypeState> = (state = initialState, action: actions.Actions) => {
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      const list = action.payload as IdMap<WorkoutType>;
      return {...state, list: {...state.list, ...list}};
    case actions.ENTITY_CREATED:
      return {...state, list: {...state.list, [action.payload.Id]: action.payload}};
    case actions.ENTITY_UPDATED:
      if (!action.payload.Id)
        return state;
      return {...state, list: {...state.list, [action.payload.Id]: {...state.list[action.payload.Id], ...action.payload}}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[action.payload]: value, ...updatedItems} = state.list;
      return {...state, list: updatedItems as any};
    default:
      return state;
  }
};

export const getItems = (state: ApplicationState): IdMap<WorkoutType> => {
  if (!state.WorkoutTypeReducer)
    return {};

  return state.WorkoutTypeReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<WorkoutType>): Array<WorkoutType> => {
  return Object.values(items);
});

export const itemsWithLiftTypesAndUserInfoSelector = createSelector(getItems, getLiftTypes, getUserToWorkoutTypes, getUserToLiftTypes, (workoutTypes: IdMap<WorkoutType>, liftTypes: IdMap<LiftType>, userToWorkoutTypes: IdMap<UserToWorkoutType>, userToLiftTypes: IdMap<UserToLiftType>): Array<WorkoutType> => {
  return Object.values(workoutTypes).map(workoutType => {
    return {
      ...workoutType,
      UserToWorkoutTypes: Object.values(userToWorkoutTypes).filter(userToWorkoutType => userToWorkoutType.WorkoutTypeId === workoutType.Id),
      LiftTypes: Object.values(liftTypes).filter(liftType => liftType.WorkoutTypeId === workoutType.Id).map(liftType => {
        return {...liftType, UserToLiftTypes: Object.values(userToLiftTypes).filter(userToLiftType => userToLiftType.LiftTypeId === liftType.Id)};
      })
    };
  });
});