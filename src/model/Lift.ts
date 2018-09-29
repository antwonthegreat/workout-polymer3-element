import LiftType from './LiftType';
import Workout from './Workout';
import WorkoutSet from './WorkoutSet';

export default interface Lift {
  Id: number;
  StartDate: string;

  LiftType: LiftType;
  LiftTypeId: number;
  Workout: Workout;
  WorkoutId: number;

  WorkoutSets: Array<WorkoutSet>;
}