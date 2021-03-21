import { getOAuthToken } from '../actions/app';
import getStore from '../reducers/index';

const endPointPrefix = 'https://graph.microsoft.com/v1.0/';

class ModelBase {
  static fetch<T>(path: string, options: RequestInit): Promise<T> {
    const url = endPointPrefix + path;
    return fetch(url, options)
      .then((res) => {
        if (res.ok) {
          return res.status === 200 || res.status === 201 ? res.json() : res;
        }
        return Promise.reject(res);
      });
  }

  static authFetch<T>(path: string, options: RequestInit): Promise<T> {
    const action = getOAuthToken();
    return getStore().store.dispatch(action)
      // TODO
      .then((res: any) => res.accessToken)
      .then((token: string) => {
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        return ModelBase.fetch(path, { headers, ...options });
      });
  }

  static get<T>(path: string, options?: RequestInit): Promise<T> {
    return ModelBase.authFetch<T>(path, { method: 'GET', ...options });
  }

  static post<T>(path: string, data: any, options?: RequestInit): Promise<T> {
    return ModelBase.authFetch<T>(path, { method: 'POST', body: JSON.stringify(data), ...options });
  }

  static delete<T>(path: string, options?: RequestInit): Promise<T> {
    return ModelBase.authFetch<T>(path, { method: 'DELETE', ...options });
  }

  static patch<T>(path: string, data: any, options?: RequestInit): Promise<T> {
    return ModelBase.authFetch<T>(path, { method: 'PATCH', body: JSON.stringify(data), ...options });
  }
}

export default ModelBase;
