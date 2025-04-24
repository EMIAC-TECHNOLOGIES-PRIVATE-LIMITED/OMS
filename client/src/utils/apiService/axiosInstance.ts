import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error("VITE_API_URL is not defined! Axios will fallback to localhost.");
}

const axiosInstance = axios.create({
    baseURL: baseURL || 'http://103.172.92.187:3001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 50000,
    withCredentials : true
});

axiosInstance.interceptors.request.use(config => {
    
    return config;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error(`[Error] ${error.response?.status || ''} - ${error.message}`);
        return Promise.reject(error);
    }
);

export default axiosInstance;