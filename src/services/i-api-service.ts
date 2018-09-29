import {GetResult} from '@leavittsoftware/api-service/lib/get-result';
import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

export interface IApiService {
  addHeader(key: string, value: string);
  deleteHeader(key: string);
  postAsync<T>(urlPath: string, body: any&ODataDto, appName: string|null): Promise<T|null>;
  patchAsync(urlPath: string, body: any&ODataDto, appName: string|null): Promise<void>;
  patchReturnDtoAsync<T>(urlPath: string, body: any&ODataDto, appName: string|null): Promise<T>;
  deleteAsync(urlPath: string, appName: string|null): Promise<void>;
  getAsync<T extends ODataDto>(urlPath: string, appName: string|null): Promise<GetResult<T>>;
}