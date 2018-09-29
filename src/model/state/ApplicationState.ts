import {AdminState} from './AdminState';
import {AppState} from './AppState';
import {DashboardState} from './DashboardState';
import {EmailTemplatesCardState} from './EmailTemplatesCardState';

export interface ApplicationState {
  AdminState?: AdminState;
  AppState?: AppState;
  DashboardState?: DashboardState;
  EmailTemplatesCardState?: EmailTemplatesCardState;
}