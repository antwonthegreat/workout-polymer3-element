import {Person} from '../Person';

export interface AdminState {
  selectedProducer: Partial<Person>|null;
}