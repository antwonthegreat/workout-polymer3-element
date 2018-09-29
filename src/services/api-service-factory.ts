import {IApiService} from './i-api-service';

export interface ApiServiceFactory {
  create(): IApiService;
}