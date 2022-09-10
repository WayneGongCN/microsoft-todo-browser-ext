import axios from 'axios';
import { API_BASE_URL, API_TIME_OUT } from '../constants';


/**
 * 
 */
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIME_OUT,
});


export default request;