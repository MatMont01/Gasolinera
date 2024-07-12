import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/token/`, {email, password});
    if (response.data.access) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user') || '{}');
};

export default {
    login,
    logout,
    getCurrentUser,
};
