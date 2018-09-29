import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {Campaign} from './Campaign';
import {CrmAccount} from './CrmAccount';
import {Person} from './Person';

export interface CampaignToCrmAccount extends ODataDto {
  Id: number;
  CrmAccountId: number;
  CrmAccount: CrmAccount;
  CampaignId: number;
  Campaign: Campaign;
  CreatedPerson: Person;
  CreatedPersonId: number;
  CreatedDate: string;
}