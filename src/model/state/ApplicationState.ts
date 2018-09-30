import {AppState} from './AppState';
import {WorkoutState} from './WorkoutState';

export interface ApplicationState {
  WorkoutState?: WorkoutState;
  AppState?: AppState;
}