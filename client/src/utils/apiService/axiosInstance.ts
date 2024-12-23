import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

axiosInstance.interceptors.request.use(config => {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem('authToken'); // Example for token handling
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
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