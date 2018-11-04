import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import WorkoutType from './WorkoutType';
import User from './User';

export default interface UserToWorkoutType extends ODataDto {
  Id: number;

  WorkoutType: WorkoutType;
  WorkoutTypeId: number;

  User: User;
  UserId: number;
  LastCompletedDate: string|null;
}