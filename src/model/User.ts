import UserToLiftType from './UserToLiftType';
import Workout from './Workout';

export default interface User {
  Id: number;
  StartDate: string;

  Workouts: Array<Workout>;
  UserToLiftTypes: Array<UserToLiftType>;
}