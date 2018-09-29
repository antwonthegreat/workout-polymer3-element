import Lift from './Lift';
import User from './User';
import WorkoutType from './WorkoutType';

export default interface Workout {
  Id: number;
  Name: string;
  StartDate: string;

  WorkoutType: WorkoutType;
  WorkoutTypeId: number;
  User: User;
  UserId: number;

  Lifts: Array<Lift>;
}