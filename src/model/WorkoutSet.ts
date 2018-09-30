import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import Lift from './Lift';

export default interface WorkoutSet extends ODataDto {
  Id: number;
  Reps: number;
  Weight: number;
  StartDate: string;

  Lift: Lift;
  LiftId: number;
}