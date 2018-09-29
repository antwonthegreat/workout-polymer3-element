import {ApiService} from '@leavittsoftware/api-service/lib/api-service';
import {AuthenticatedTokenProvider} from '@leavittsoftware/api-service/lib/authenticated-token-provider';
import {determineIsDevelopment} from '@leavittsoftware/titanium-elements/lib/titanium-dev-detection-mixin';

import {ApiServiceFactory} from './api-service-factory';

export class HttpApiServiceFactory implements ApiServiceFactory {
  create(): ApiService {
    const apiService = new ApiService(new AuthenticatedTokenProvider());
    apiService.baseUrl = determineIsDevelopment(window.location.origin) ? 'https://devapi2.leavitt.com/' : 'https://api2.leavitt.com/';
    return apiService;
  }
}