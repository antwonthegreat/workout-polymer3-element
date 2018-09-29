import { IApiService } from './i-api-service';

export default class ApiService implements IApiService {
    baseUrl: string = 'http://localhost:59465/';
    userId = 1;

    private _createUri(urlPath: string): string {
      return this.baseUrl + urlPath;
    }

    async getAsync<T>(urlPath: string, _appName: string|null = null):
        Promise<GetResult<T>> {
      let headers:
          any = {'Content-Type': 'application/json', 'UserId': this.userId};
      // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;
      headers['Accept'] = 'application/json';

      let response;
      try {
        response = await fetch(
            this._createUri(urlPath), {method: 'GET', headers: headers});

      } catch (error) {
        if (error.message != null &&
            error.message.indexOf('Failed to fetch') !== -1)
          return Promise.reject(
              'Network error. Check your connection and try again.');

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
      let headers:
          any = {'Content-Type': 'application/json', 'UserId': this.userId};
      // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;

      let response;
      try {
        response = await fetch(
            this._createUri(urlPath),
            {method: 'POST', body: JSON.stringify(body), headers: headers});
      } catch (error) {
        if (error.message != null &&
            error.message.indexOf('Failed to fetch') !== -1)
          return Promise.reject(
              'Network error. Check your connection and try again.');

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
        return Promise.reject('Request error, please try again later.');
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
      let headers:
          any = {'Content-Type': 'application/json', 'UserId': this.userId};
      // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;

      // if (this.appNameKey !== '')
      //   headers[this.appNameKey] = appName || this.appName;

      let response;
      try {
        response = await fetch(
            this._createUri(urlPath),
            {method: 'PATCH', body: JSON.stringify(body), headers: headers});
      } catch (error) {
        if (error.message != null &&
            error.message.indexOf('Failed to fetch') !== -1)
          return Promise.reject(
              'Network error. Check your connection and try again.');

        return Promise.reject(error);
      }

      if (response.status === 204) {
        return Promise.resolve();
      }

      let json;
      try {
        json = await response.json();

        if (json.error != null) {
          return Promise.reject(json.error.message);
        }

        return Promise.reject('Request error, please try again later.');
      } catch (error) {
        return Promise.reject(`The server sent back invalid JSON. ${error}`);
      }
    }

    async deleteAsync(urlPath: string): Promise<void> {
      let headers:
          any = {'Content-Type': 'application/json', 'UserId': this.userId};
      // headers['Authorization'] = `Bearer ${await this._getTokenAsync()}`;
      // if (this.appNameKey !== '')
      //   headers[this.appNameKey] = appName || this.appName;

      let response;
      try {
        response = await fetch(
            this._createUri(urlPath), {method: 'DELETE', headers: headers});
      } catch (error) {
        if (error.message != null &&
            error.message.indexOf('Failed to fetch') !== -1)
          return Promise.reject(
              'Network error. Check your connection and try again.');

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

  class GetResult<T> {
    private data: Array<T>;
    public odataCount: number;
    constructor(json: any) {
      if (!isNaN(Number(json['@odata.count']))) {
        this.odataCount = Number(json['@odata.count']);
      }

      if (Array.isArray(json.value)) {
        this.data = json.value.map((o: any) => {
          return GetResult.convertODataInfo<T>(o);
        });
      } else {
        this.data = [];
        this.data.push(json.hasOwnProperty('value') ? json.value : json);
      }
    }

    count(): number {
      return this.data.length;
    }

    firstOrDefault(): T|null {
      if (this.count() > 0) {
        return GetResult.convertODataInfo<T>(this.data[0]);
      }
      return null;
    }

    toList(): Array<T> {
      return this.data;
    }

    toDictionary(): {[key: number]: T} {
      return this.data.reduce((acc: any, item: any) => {
        acc[item.Id] = item;
        return acc;
      }, {});
    }

    static convertODataInfo<T>(item: any): T {
      if (item['@odata.type']) {
        if (!item._odataInfo) {
          item._odataInfo = {};
        }
        item._odataInfo.type = item['@odata.type'];
        delete item['@odata.type'];

        let parts = item._odataInfo.type.split('.');
        item._odataInfo.shortType = parts[parts.length - 1];
      }
      return item;
    }
  }