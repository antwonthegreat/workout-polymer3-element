import {ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {Person} from '../model/Person';

export const SET_SELECTED_PRODUCER = 'SET_SELECTED_PRODUCER';
export const Actions = {
  setSelectedProducer: (producer: Partial<Person>|null) => createAction(SET_SELECTED_PRODUCER, producer)
};

export type Actions = ActionsUnion<typeof Actions>;