import { getOAuthToken } from '../actions/account';

class ModelBase {
  constructor() {
    this.tokenOptions = { scopes: ['User.Read', 'Tasks.ReadWrite.Shared'] };
  }

  // eslint-disable-next-line class-methods-use-this
  fetch(url, options) {
    return fetch(url, options)
      // eslint-disable-next-line no-nested-ternary
      .then((res) => (res.ok ? res.status === 204 ? res : res.json() : res));
  }

  authFetch(url, options) {
    const action = getOAuthToken(this.tokenOptions);
    return window.store.dispatch(action)
      .then((res) => res.accessToken)
      .then((token) => {
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        return this.fetch(url, { headers, ...options });
      });
  }

  get(url, options) {
    return this.authFetch(url, { method: 'GET', ...options });
  }

  post(url, data, options) {
    return this.authFetch(url, { method: 'POST', body: JSON.stringify(data), ...options });
  }

  delete(url, options) {
    return this.authFetch(url, { method: 'DELETE', ...options });
  }

  patch(url, data, options) {
    return this.authFetch(url, { method: 'PATCH', body: JSON.stringify(data), ...options });
  }
}

export default ModelBase;
