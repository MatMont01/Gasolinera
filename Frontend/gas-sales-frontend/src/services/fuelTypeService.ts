import {API} from './api';

const getFuelTypes = async () => {
    const response = await API.get('/fueltypes/');
    return response.data;
};

const createFuelType = async (fuelType: any) => {
    const response = await API.post('/fueltypes/', fuelType);
    return response.data;
};

const deleteFuelType = async (id: number) => {
    const response = await API.delete(`/fueltypes/${id}/`);
    return response.data;
};

export default {
    getFuelTypes,
    createFuelType,
    deleteFuelType,
};
