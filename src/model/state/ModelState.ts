import {IdMap} from '../../services/action-helpers';
export interface ModelState<T> {
  list: IdMap<T>;
}