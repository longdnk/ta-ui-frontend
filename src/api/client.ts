import axios from "axios";
import { applyToken } from "helper";

export const axiosClient = axios.create({
    baseURL: process.env.NODE_ENV !== "production" ?
        process.env.WDS_SOCKET_PATH
        :
        process.env.REACT_APP_API_URL,
    timeout: 30000,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: '',
    },
})

// Add a request interceptor
axiosClient.interceptors.request.use(config => {
    // Do something before request is sent
    const loadConfig = applyToken();
    config.headers = loadConfig.headers;
    return config;
}, error => {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axiosClient.interceptors.response.use(response => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, error => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});