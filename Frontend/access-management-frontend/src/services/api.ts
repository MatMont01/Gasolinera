import axios from 'axios';
import authService from './authService';

const API = axios.create({
    baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use(
    (config) => {
        const user = authService.getCurrentUser();
        if (user?.access) {
            config.headers.Authorization = `Bearer ${user.access}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;
