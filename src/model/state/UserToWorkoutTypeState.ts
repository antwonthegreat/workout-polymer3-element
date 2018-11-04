import {IdMap} from '../../services/action-helpers';
import UserToWorkoutType from '../UserToWorkoutType';

export interface UserToWorkoutTypeState {
  listByWorkoutTypeId: IdMap<UserToWorkoutType>;
}