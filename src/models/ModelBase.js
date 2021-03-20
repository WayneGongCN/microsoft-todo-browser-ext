import { getOAuthToken } from '../actions/app';
import getStore from '../reducers';

const endPointPrefix = 'https://graph.microsoft.com/v1.0/';

class ModelBase {
  static fetch(path, options) {
    const url = endPointPrefix + path;
    return fetch(url, options)
      .then((res) => {
        if (res.ok) {
          return res.status === 200 || res.status === 201 ? res.json() : res;
        }
        return Promise.reject(res);
      });
  }

  static authFetch(path, options) {
    const action = getOAuthToken();
    return getStore().store.dispatch(action)
      .then((res) => res.accessToken)
      .then((token) => {
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        return ModelBase.fetch(path, { headers, ...options });
      });
  }

  static get(path, options) {
    return ModelBase.authFetch(path, { method: 'GET', ...options });
  }

  static post(path, data, options) {
    return ModelBase.authFetch(path, { method: 'POST', body: JSON.stringify(data), ...options });
  }

  static delete(url, options) {
    return ModelBase.authFetch(url, { method: 'DELETE', ...options });
  }

  static patch(url, data, options) {
    return ModelBase.authFetch(url, { method: 'PATCH', body: JSON.stringify(data), ...options });
  }
}

export default ModelBase;
