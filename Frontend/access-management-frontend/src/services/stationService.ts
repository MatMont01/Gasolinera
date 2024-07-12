import API from './api';

const getStations = async () => {
    const response = await API.get('/stations/');
    return response.data;
};

const getStationById = async (stationId: string) => {
    const response = await API.get(`/stations/${stationId}/`);
    return response.data;
};

const createStation = async (station: any) => {
    const response = await API.post('/stations/', station);
    return response.data;
};

const updateStation = async (stationId: string, station: any) => {
    const response = await API.put(`/stations/${stationId}/`, station);
    return response.data;
};

const deleteStation = async (stationId: string) => {
    const response = await API.delete(`/stations/${stationId}/`);
    return response.data;
};

export default {
    getStations,
    getStationById,
    createStation,
    updateStation,
    deleteStation,
};
