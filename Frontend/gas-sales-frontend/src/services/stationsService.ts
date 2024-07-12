import { API } from './api';

const getStations = async () => {
    const response = await API.get('/stations/');
    return response.data;
};

const getStationById = async (id: string) => {
    const response = await API.get(`/stations/${id}/`);
    return response.data;
};

const getFuelTypesByStation = async (stationId: string) => {
    const response = await API.get(`/stations/${stationId}/fuel-types/`);
    return response.data;
};

const getPumpsByStation = async (stationId: string) => {
    const response = await API.get(`/stations/${stationId}/pumps/`);
    return response.data;
};

export default {
    getStations,
    getStationById,
    getFuelTypesByStation,
    getPumpsByStation,
};