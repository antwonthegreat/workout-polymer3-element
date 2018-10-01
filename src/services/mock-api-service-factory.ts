import {ApiServiceFactory} from '../../src/services/api-service-factory';
import {BaseMockApiService} from './base-mock-api-service';

export class MockApiServiceFactory implements ApiServiceFactory {
  create() {
    return new BaseMockApiService();
  }
}