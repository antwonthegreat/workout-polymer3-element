import {Reducer} from 'redux';

import * as actions from '../actions/workout-actions';
import {WorkoutState} from '../model/state/WorkoutState';
import Workout from '../model/Workout';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as WorkoutState;

export const WorkoutReducer: Reducer<WorkoutState> = (state = initialState, action: actions.Actions) => {
  const entity = action.payload as Workout;
  const id = action.payload as number;
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      const list = action.payload as IdMap<Workout>;
      return {...state, list};
    case actions.ENTITY_CREATED:
      return {...state, list: {...state.list, [entity.Id]: entity}};
    case actions.ENTITY_UPDATED:
      return {...state, list: {...state.list, [entity.Id]: {...state.list[entity.Id], ...entity}}};
    case actions.ENTITY_DELETED:
      // destructuring black magic
      const {[id]: value, ...updatedItems} = state.list;
      return {...state, list: updatedItems as any};
    default:
      return state;
  }
};
