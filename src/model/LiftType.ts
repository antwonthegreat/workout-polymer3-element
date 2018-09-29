import Lift from './Lift';
import UserToLiftType from './UserToLiftType';
import WorkoutType from './WorkoutType';

export default interface LiftType {
  Id: number;
  Name: string;
  Timed: boolean;

  WorkoutType: WorkoutType;
  WorkoutTypeId: number;

  Lifts: Array<Lift>;
  UserToLiftTypes: Array<UserToLiftType>;
}