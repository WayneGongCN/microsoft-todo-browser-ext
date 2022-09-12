const request = <T>(url: string, options: RequestInit = {}): Promise<T> => {
  options.headers = { 'content-type': 'application/json', ...(options.headers || null) }

  return fetch(url, options).then(res => {
    if (res.ok) return res.json()
    throw res
  })
}

export default request