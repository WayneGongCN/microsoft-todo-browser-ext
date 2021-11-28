import axios from 'axios';


const instance = axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0/',
  timeout: 1000 * 60
})

export default instance