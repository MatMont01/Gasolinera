import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8002/api',
});

const accessAPI = axios.create({
    baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

accessAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export {API, accessAPI};
