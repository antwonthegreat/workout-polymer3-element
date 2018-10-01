import {AppState} from './AppState';
import {LiftState} from './LiftState';
import {LiftTypeState} from './LiftTypeState';
import {UserState} from './UserState';
import {UserToLiftTypeState} from './UserToLiftTypeState';
import {WorkoutSetState} from './WorkoutSetState';
import {WorkoutState} from './WorkoutState';
import {WorkoutTypeState} from './WorkoutTypeState';

export interface ApplicationState {
  AppReducer?: AppState;
  WorkoutReducer?: WorkoutState;
  WorkoutTypeReducer?: WorkoutTypeState;
  LiftTypeReducer?: LiftTypeState;
  LiftReducer?: LiftState;
  UserReducer?: UserState;
  UserToLiftTypeReducer?: UserToLiftTypeState;
  WorkoutSetReducer?: WorkoutSetState;
}