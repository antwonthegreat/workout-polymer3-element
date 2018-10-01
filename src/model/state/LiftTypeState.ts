import LiftType from '../LiftType';
import {ModelState} from './ModelState';

export interface LiftTypeState extends ModelState<LiftType> {
  selectedId: number|null;
}