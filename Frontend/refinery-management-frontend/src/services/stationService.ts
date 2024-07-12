import { API } from './api';

const getStations = async () => {
    const response = await API.get('http://localhost:8001/api/stations/');
    return response.data;
};

const getStationStocks = async (stationId: number) => {
    const response = await API.get(`http://localhost:8001/api/stations/${stationId}/station-stocks/`);
    return response.data;
};

export default {
    getStations,
    getStationStocks
};
