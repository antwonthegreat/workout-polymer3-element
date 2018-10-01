import WorkoutType from '../WorkoutType';
import {ModelState} from './ModelState';

export interface WorkoutTypeState extends ModelState<WorkoutType> {
  selectedId: number|null;
}