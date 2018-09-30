import ApiService from './api-service';

import {ApiServiceFactory} from './api-service-factory';
import { IApiService } from './i-api-service';

export class HttpApiServiceFactory implements ApiServiceFactory {
  create(): IApiService {
    const apiService = new ApiService();
    return apiService;
  }
}