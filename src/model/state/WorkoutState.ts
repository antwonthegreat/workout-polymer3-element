import {IdMap} from '../../services/action-helpers';
import Workout from '../Workout';

export interface WorkoutState {
  selectedWorkoutId: number|null;
  list: IdMap<Workout>;
}