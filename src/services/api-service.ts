import {GetResult} from '@leavittsoftware/api-service/lib/get-result';
import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';

import {IApiService} from './i-api-service';

export default class ApiService implements IApiService {
  baseUrl: string = 'http://localhost:59465/';
  // TODO: remove default once authorization works
  userId = 1;

  private _createUri(urlPath: string): string {
    return this.baseUrl + urlPath;
  }

  async getAsync<T extends ODataDto>(urlPath: string, _appName: string|null = null): Promise<GetResult<T>> {
    let headers: any = {'Content-Type': 'application/json', 'UserId': this.userId};
    // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;
    headers['Accept'] = 'application/json';

    let response;
    try {
      response = await fetch(this._createUri(urlPath), {method: 'GET', headers: headers});

    } catch (error) {
      if (error.message != null && error.message.indexOf('Failed to fetch') !== -1)
        return Promise.reject('Network error. Check your connection and try again.');

      return Promise.reject(error);
    }

    let json;
    try {
      json = await response.json();
    } catch (error) {
      return Promise.reject(`The server sent back invalid JSON. ${error}`);
    }

    if (json.error) {
      return Promise.reject(json.error.message);
    }

    return Promise.resolve(new GetResult<T>(json));
  }

  async postAsync<T>(urlPath: string, body: any): Promise<T|null> {
    // Add in the odata model info if it not already on the object
    if (body._odataInfo && !body['@odata.type']) {
      if (body._odataInfo.type) {
        body['@odata.type'] = body._odataInfo.type;
      }
      delete body._odataInfo;
    }
    let headers: any = {'Content-Type': 'application/json', 'UserId': this.userId};
    // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;

    let response;
    try {
      response = await fetch(this._createUri(urlPath), {method: 'POST', body: JSON.stringify(body), headers: headers});
    } catch (error) {
      if (error.message != null && error.message.indexOf('Failed to fetch') !== -1)
        return Promise.reject('Network error. Check your connection and try again.');

      return Promise.reject(error);
    }

    if (response.status === 204) {
      return Promise.resolve(null);
    }

    let json;
    try {
      json = await response.json();
    } catch (error) {
      return Promise.reject(`The server sent back invalid JSON. ${error}`);
    }

    if (json.error != null) {
      return Promise.reject(json.error.message);
    }

    if (response.status === 201 || response.status === 200) {
      return Promise.resolve(json);
    } else {
      return Promise.reject(`Request error, please try again later.`);
    }
  }

  async patchAsync(urlPath: string, body: any): Promise<void> {
    // Add in the odata model info if it not already on the object
    if (body._odataInfo && !body['@odata.type']) {
      if (body._odataInfo.type) {
        body['@odata.type'] = body._odataInfo.type;
      }
      delete body._odataInfo;
    }
    let headers: any = {'Content-Type': 'application/json', 'UserId': this.userId};
    // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;

    // if (this.appNameKey !== '')
    //   headers[this.appNameKey] = appName || this.appName;

    let response;
    try {
      response = await fetch(this._createUri(urlPath), {method: 'PATCH', body: JSON.stringify(body), headers: {...headers, 'Prefer': 'return=representation'}});
    } catch (error) {
      if (error.message != null && error.message.indexOf('Failed to fetch') !== -1)
        return Promise.reject('Network error. Check your connection and try again.');

      return Promise.reject(error);
    }

    if (response.status === 200) {
      return Promise.resolve();
    }

    let json;
    try {
      json = await response.json();

      if (json.error != null) {
        return Promise.reject(json.error.message);
      }

      return Promise.reject(`Request error ${response.status}, please try again later.`);
    } catch (error) {
      return Promise.reject(`The server sent back invalid JSON. ${error}`);
    }
  }

  async patchReturnDtoAsync<T>(urlPath: string, body: any): Promise<T> {
    // Add in the odata model info if it not already on the object
    if (body._odataInfo && !body['@odata.type']) {
      if (body._odataInfo.type) {
        body['@odata.type'] = body._odataInfo.type;
      }
      delete body._odataInfo;
    }
    let headers: any = {'Content-Type': 'application/json', 'UserId': this.userId};
    // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;

    // if (this.appNameKey !== '')
    //   headers[this.appNameKey] = appName || this.appName;

    let response;
    try {
      response = await fetch(this._createUri(urlPath), {method: 'PATCH', body: JSON.stringify(body), headers: {...headers, 'Prefer': 'return=representation'}});
    } catch (error) {
      if (error.message != null && error.message.indexOf('Failed to fetch') !== -1)
        return Promise.reject('Network error. Check your connection and try again.');

      return Promise.reject(error);
    }

    let json;
    try {
      json = await response.json();

      if (json.error != null) {
        return Promise.reject(json.error.message);
      }

      if (response.status === 200) {
        return Promise.resolve(json);
      } else {
        return Promise.reject('Request error, please try again later.');
      }
    } catch (error) {
      return Promise.reject(`The server sent back invalid JSON. ${error}`);
    }
  }

  async deleteAsync(urlPath: string): Promise<void> {
    let headers: any = {'Content-Type': 'application/json', 'UserId': this.userId};
    // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;
    // if (this.appNameKey !== '')
    //   headers[this.appNameKey] = appName || this.appName;

    let response;
    try {
      response = await fetch(this._createUri(urlPath), {method: 'DELETE', headers: headers});
    } catch (error) {
      if (error.message != null && error.message.indexOf('Failed to fetch') !== -1)
        return Promise.reject('Network error. Check your connection and try again.');

      return Promise.reject(error);
    }

    if (response.status === 204) {
      return Promise.resolve();
    }

    if (response.status === 404) {
      return Promise.reject('Not Found');
    }

    let json;
    try {
      json = await response.json();
    } catch (error) {
      return Promise.reject(`The server sent back invalid JSON. ${error}`);
    }

    if (json.error != null) {
      return Promise.reject(json.error.message);
    }

    if (response.status === 201) {
      return Promise.resolve(json);
    } else {
      return Promise.reject('Request error, please try again later.');
    }
  }
}
