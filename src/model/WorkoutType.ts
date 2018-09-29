import LiftType from './LiftType';
import Workout from './Workout';

export default interface WorkoutType {
  Id: number;
  Name: string;

  Workouts: Array<Workout>;
  LiftTypes: Array<LiftType>;
}