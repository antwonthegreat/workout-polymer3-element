import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {CampaignToPerson} from './CampaignToPerson';
import {CrmAccount} from './CrmAccount';
import {EloquaEmailTemplateToPerson} from './EloquaEmailTemplateToPerson';

export interface Person extends ODataDto {
  Id: number;
  LastName: string;
  FirstName: string;
  CampaignToPeople: Array<CampaignToPerson>;
  CrmAccounts: Array<CrmAccount>;
  EloquaEmailTemplateToPeople: Array<EloquaEmailTemplateToPerson>;
}