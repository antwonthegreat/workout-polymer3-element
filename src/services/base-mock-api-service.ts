import {GetResult} from '@leavittsoftware/api-service/lib/get-result';
import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import {IApiService} from '../../src/services/i-api-service';

export class BaseMockApiService implements IApiService {
  addHeader = () => {};
  deleteHeader = () => {};

  public postAsync<T>(): Promise<T|null> {
    return Promise.reject('postAsync not implemented');
  }
  public patchAsync(): Promise<void> {
    return Promise.reject('patchAsync not implemented');
  }
  public patchReturnDtoAsync(): Promise<any> {
    return Promise.reject('patchReturnDtoAsync not implemented');
  }
  public deleteAsync(): Promise<void> {
    return Promise.reject('deleteAsync not implemented');
  }
  public getAsync<T extends ODataDto>(): Promise<GetResult<T>> {
    return Promise.reject('getAsync not implemented');
  }
}