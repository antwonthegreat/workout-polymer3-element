import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as actions from '../actions/workout-type-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {WorkoutTypeState} from '../model/state/WorkoutTypeState';
import WorkoutType from '../model/WorkoutType';
import {IdMap} from '../services/action-helpers';

const initialState = {
  selectedId: null,
  list: {}
} as WorkoutTypeState;

export const WorkoutTypeReducer: Reducer<WorkoutTypeState> = (state = initialState, action: actions.Actions) => {
  const entity = action.payload as WorkoutType;
  const id = action.payload as number;
  switch (action.type) {
    case actions.ENTITIES_RECEIVED:
      const list = action.payload as IdMap<WorkoutType>;
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

const getItems = (state: ApplicationState): IdMap<WorkoutType> => {
  if (!state.WorkoutTypeReducer)
    return {};

  return state.WorkoutTypeReducer.list;
};

export const itemsSelector = createSelector(getItems, (items: IdMap<WorkoutType>): Array<WorkoutType> => {
  return Object.values(items);
});