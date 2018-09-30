import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import LiftType from './LiftType';
import Workout from './Workout';
import WorkoutSet from './WorkoutSet';

export default interface Lift extends ODataDto {
  Id: number;
  StartDate: string;

  LiftType: LiftType;
  LiftTypeId: number;
  Workout: Workout;
  WorkoutId: number;

  WorkoutSets: Array<WorkoutSet>;
}