export interface DashboardState {
  CRMAccountGuid: string;
  Page: string;  // main|claim|loading|already-claimed
  ToolbarTitle: string;
  SelectedEmailTemplateId?: number;
}