import axios from 'axios';
import { API_BASE_URL, API_TIME_OUT } from '../constants';
import { ErrorCode } from '../constants/enums';
import { store } from '../redux';
import { acquireToken } from '../redux/auth';
import AppError from './error';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIME_OUT,
});

instance.interceptors.request.use(async (conf) => {
  await store.dispatch(acquireToken(false));
  const accessToken = store.getState().auth.authenticationResult?.accessToken;
  if (!accessToken) throw new AppError({ code: ErrorCode.UNKNOW, message: 'accessToken is null' });

  conf.headers.Authorization = `Bearer ${accessToken}`;
  return conf;
});

instance.interceptors.response.use((res) => {
  if (res.status >= 200 && res.status < 400) return res.data;
  else return Promise.reject(new AppError({ code: ErrorCode.RESPONSE, message: `Request error status ${res.status} ${res.data}` }));
});

export default instance;
