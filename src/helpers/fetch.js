export default (tokenOptions) => (url, method, data, options) => {
  const action = getOAuthToken(tokenOptions);
  if (method === 'GET') options = data;

  return window.store.dispatch(action)
    .then((res) => res.accessToken)
    .then((token) => fetch(url, {
      method,
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...options,
    }))
    // eslint-disable-next-line no-nested-ternary
    .then((res) => (res.ok ? res.status === 200 ? res.json() : res : Promise.reject(res)))
    .then(res => {
      console.log(res)
      return res
    })
};