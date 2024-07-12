import API from './api';

const getUsers = async () => {
    const response = await API.get('/users/');
    return response.data;
};

const getUserById = async (userId: string) => {
    const response = await API.get(`/users/${userId}/`);
    return response.data;
};

const createUser = async (user: any) => {
    const response = await API.post('/users/', user);
    return response.data;
};

const updateUser = async (userId: string, user: any) => {
    const response = await API.patch(`/users/${userId}/`, user);
    return response.data;
};

const deleteUser = async (userId: string) => {
    const response = await API.delete(`/users/${userId}/`);
    return response.data;
};

export default {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
