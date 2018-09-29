import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {CampaignToCrmAccount} from './CampaignToCrmAccount';
import {CampaignToPerson} from './CampaignToPerson';

export interface Campaign extends ODataDto {
  Id: number;
  EloquaCampaignId: number;
  Name: string;
  Description: string;
  ActivationId: string;
  CampaignToPeople: Array<CampaignToPerson>;
  CampaignToCrmAccounts: Array<CampaignToCrmAccount>;
}