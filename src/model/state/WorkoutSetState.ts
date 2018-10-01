import WorkoutSet from '../WorkoutSet';
import {ModelState} from './ModelState';

export interface WorkoutSetState extends ModelState<WorkoutSet> {
  selectedId: number|null;
}