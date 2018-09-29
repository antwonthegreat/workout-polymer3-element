import Lift from './Lift';

export default interface WorkoutSet {
  Id: number;
  Reps: number;
  Weight: number;
  StartDate: string;

  Lift: Lift;
  LiftId: number;
}