import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import Lift from './Lift';
import User from './User';
import WorkoutType from './WorkoutType';

export default interface Workout extends ODataDto {
  Id: number;
  Name: string;
  StartDate: string;

  WorkoutType: WorkoutType;
  WorkoutTypeId: number;
  User: User;
  UserId: number;

  Lifts: Array<Lift>;

  expanded?: boolean;
}