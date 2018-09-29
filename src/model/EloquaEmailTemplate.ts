import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {EloquaEmailTemplateToPerson} from './EloquaEmailTemplateToPerson';

export interface EloquaEmailTemplate extends ODataDto {
  Id: number;
  EloquaEmailId: number;
  Name: string;
  EloquaEmailTemplateToPeople: Array<EloquaEmailTemplateToPerson>;
}