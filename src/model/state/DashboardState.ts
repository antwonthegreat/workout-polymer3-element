import {MarketingHomeDto} from '../MarketingHomeDto';

export interface DashboardState {
  CRMAccountGuid: string;
  Page: string;  // main|claim|loading|already-claimed
  ToolbarTitle: string;
  MarketingHomeDto: MarketingHomeDto;
  SelectedEmailTemplateId?: number;
}