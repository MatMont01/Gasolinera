import {API} from './api';

const getPumps = async () => {
    const response = await API.get('/pumps/');
    return response.data;
};

const getPumpById = async (id: string) => {
    const response = await API.get(`/pumps/${id}/`);
    return response.data;
};

const createPump = async (pump: any) => {
    const response = await API.post('/pumps/', pump);
    return response.data;
};

const updatePump = async (id: string, pump: any) => {
    const response = await API.patch(`/pumps/${id}/`, pump);
    return response.data;
};

const deletePump = async (id: string) => {
    const response = await API.delete(`/pumps/${id}/`);
    return response.data;
};

const getFuelTypes = async () => {
    const response = await API.get('/fueltypes/');
    return response.data;
};

export default {
    getPumps,
    getPumpById,
    createPump,
    updatePump,
    deletePump,
    getFuelTypes,
};
