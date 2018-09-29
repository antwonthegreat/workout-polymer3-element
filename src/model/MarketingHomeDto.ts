import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {Campaign} from './Campaign';
import {EloquaEmailTemplate} from './EloquaEmailTemplate';

export interface MarketingHomeDto extends ODataDto {
  AccountName: string;
  EmailAddress: string;
  EloquaId?: number;
  Campaigns: Array<Campaign>;
  EloquaEmails: Array<EloquaEmailTemplate>;
  IsGloballySubscribed: boolean;
  IsLocked: boolean;
  DoNotCall: boolean;
  PreferredContactMethod: string;
  RecentSource: string;
  OriginalSource: string;
}