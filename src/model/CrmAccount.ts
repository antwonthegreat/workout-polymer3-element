import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {CampaignToCrmAccount} from './CampaignToCrmAccount';
import {Person} from './Person';

export interface CrmAccount extends ODataDto {
  Id: number;
  Phone: string;
  Name: string;
  Email: string;
  Street: string;
  City: string;
  State: string;
  Zip: string;
  PersonId: number;
  OriginalSource: string;
  RecentSource: string;
  Person: Person;
  CampaignToCrmAccounts: Array<CampaignToCrmAccount>;
}