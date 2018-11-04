import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import UserToLiftType from './UserToLiftType';
import UserToWorkoutType from './UserToWorkoutType';
import Workout from './Workout';

export default interface User extends ODataDto {
  Id: number;
  StartDate: string;

  Workouts: Array<Workout>;
  UserToLiftTypes: Array<UserToLiftType>;
  UserToWorkoutTypes: Array<UserToWorkoutType>;
}