import axios from 'axios';
import { API_BASE_URL , API_TIME_OUT} from '../constants';
import { store } from '../redux';
import AppError, { ErrorCode } from './error';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIME_OUT,
});

instance.interceptors.request.use((conf) => {
  const hasAuthHeader = conf.headers?.Authorization;
  if (hasAuthHeader) return conf;

  const accessToken = store.getState().auth?.authenticationResult?.accessToken;
  if (!accessToken) return conf;

  conf.headers.Authorization = `Bearer ${accessToken}`;
  return conf;
});

instance.interceptors.response.use(
  (res) => {
    if (res.status >= 200 && res.status <= 400) {
      return res.data;
    }
    const err = new AppError({
      code: ErrorCode.UNKNOW,
      message: `Request error status ${res.status} ${res.data}`,
    });
    return Promise.reject(err);
  },
  (err) => Promise.reject(new AppError({ code: ErrorCode.UNKNOW, message: err.message })),
);

export default instance;
