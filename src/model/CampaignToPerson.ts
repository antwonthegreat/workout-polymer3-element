import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {Campaign} from './Campaign';
import {Person} from './Person';

export interface CampaignToPerson extends ODataDto {
  Id: number;
  CampaignId: number;
  Campaign: Campaign;
  Person: Person;
  PersonId: number;
}