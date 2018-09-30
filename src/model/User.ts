import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import UserToLiftType from './UserToLiftType';
import Workout from './Workout';

export default interface User extends ODataDto {
  Id: number;
  StartDate: string;

  Workouts: Array<Workout>;
  UserToLiftTypes: Array<UserToLiftType>;
}