import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import {EloquaEmailTemplate} from './EloquaEmailTemplate';
import {Person} from './Person';

export interface EloquaEmailTemplateToPerson extends ODataDto {
  Id: number;
  EloquaEmailTemplateId: number;
  EloquaEmailTemplate: EloquaEmailTemplate;
  Person: Person;
  PersonId: number;
}