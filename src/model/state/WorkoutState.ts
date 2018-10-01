import Workout from '../Workout';
import {ModelState} from './ModelState';

export interface WorkoutState extends ModelState<Workout> {
  selectedId: number|null;
}