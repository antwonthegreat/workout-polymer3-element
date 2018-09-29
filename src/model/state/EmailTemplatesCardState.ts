import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import {EloquaEmailTemplate} from '../EloquaEmailTemplate';

export interface EmailTemplatesCardState {
  EmailTemplates: StringMap<EloquaEmailTemplate>;
  IsLoading: boolean;
}