// checkpointService.ts

import { accessAPI, API } from './api';

const getCheckpoints = async () => {
    const response = await API.get('/routecheckpoints/');
    return response.data;
};

const getCheckpointById = async (id: number) => {
    const response = await API.get(`/routecheckpoints/${id}/`);
    return response.data;
};

const createCheckpoint = async (checkpointData: any) => {
    // Fetch station location from sales API
    const stationResponse = await API.get(`/stations/${checkpointData.station_id}/location/`);
    const stationLocation = stationResponse.data;

    // Add latitude and longitude to checkpointData
    checkpointData.latitude = stationLocation.latitude;
    checkpointData.longitude = stationLocation.longitude;

    const response = await API.post('/routecheckpoints/', checkpointData);
    return response.data;
};

const updateCheckpoint = async (id: number, checkpointData: any) => {
    const response = await API.patch(`/routecheckpoints/${id}/`, checkpointData);
    return response.data;
};

const deleteCheckpoint = async (id: number) => {
    const response = await API.delete(`/routecheckpoints/${id}/`);
    return response.data;
};

const getStationLocation = async (stationId: string) => {
    const response = await API.get(`/stations/${stationId}/location/`);
    return response.data;
};

export default {
    getCheckpoints,
    getCheckpointById,
    createCheckpoint,
    updateCheckpoint,
    deleteCheckpoint,
    getStationLocation,
};
