import {AppState} from './AppState';
import {WorkoutState} from './WorkoutState';
import {WorkoutTypeState} from './WorkoutTypeState';

export interface ApplicationState {
  WorkoutReducer?: WorkoutState;
  WorkoutTypeReducer?: WorkoutTypeState;
  AppReducer?: AppState;
}