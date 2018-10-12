import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import LiftType from './LiftType';
import UserToLiftType from './UserToLiftType';
import Workout from './Workout';

export default interface WorkoutType extends ODataDto {
  Id: number;
  Name: string;

  Workouts: Array<Workout>;
  LiftTypes: Array<LiftType>;
  UserToLiftTypes: Array<UserToLiftType>;
}