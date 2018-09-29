import {ApiServiceFactory} from '../services/api-service-factory';

export interface ActionInjectable {
  apiServiceFactory: ApiServiceFactory;
}