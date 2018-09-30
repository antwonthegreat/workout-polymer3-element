import {GetResult} from '@leavittsoftware/api-service/lib/get-result';
import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

export interface IApiService {
  postAsync<T>(urlPath: string, body: any&ODataDto, appName: string|null): Promise<T|null>;
  patchAsync(urlPath: string, body: any&ODataDto, appName: string|null): Promise<void>;
  deleteAsync(urlPath: string, appName: string|null): Promise<void>;
  getAsync<T extends ODataDto>(urlPath: string, _appName: string|null): Promise<GetResult<T>>;
}