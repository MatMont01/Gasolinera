import { API } from './api';

const getFuelTypes = async () => {
    const response = await API.get('/fueltypes/');
    return response.data;
};

const createFuelType = async (fuelTypeData: any) => {
    const response = await API.post('/fueltypes/', fuelTypeData);
    return response.data;
};

const updateFuelType = async (id: number, fuelTypeData: any) => {
    const response = await API.patch(`/fueltypes/${id}/`, fuelTypeData);
    return response.data;
};

const deleteFuelType = async (id: number) => {
    const response = await API.delete(`/fueltypes/${id}/`);
    return response.data;
};

export default {
    getFuelTypes,
    createFuelType,
    updateFuelType,
    deleteFuelType,
};
