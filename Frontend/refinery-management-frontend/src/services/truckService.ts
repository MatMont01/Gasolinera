// truckService.ts
import {accessAPI, API} from './api';
import axios from "axios";

const getTrucks = async () => {
    const response = await API.get('/trucks/');
    return response.data;
};

const createTruck = async (truckData: any) => {
    const response = await API.post('/trucks/', truckData);
    return response.data;
};

const updateTruck = async (id: number, truckData: any) => {
    const response = await API.patch(`/trucks/${id}/`, truckData);
    return response.data;
};

const deleteTruck = async (id: number) => {
    const response = await API.delete(`/trucks/${id}/`);
    return response.data;
};

const getDrivers = async () => {
    const response = await accessAPI.get('/users/role/driver/');
    return response.data;
};

const getTruckLocation = async () => {
    const response = await API.get('/truck/location/', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = response.data;
    return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude)
    };
};


const getCheckpointsByRoute = async (routeId: number) => {
    const response = await API.get(`/route/${routeId}/checkpoints/`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data.map((checkpoint: any) => ({
        ...checkpoint,
        latitude: parseFloat(checkpoint.latitude),
        longitude: parseFloat(checkpoint.longitude),
        route: checkpoint.route || {},  // Ensure route is at least an empty object
        fuel_type: checkpoint.route && checkpoint.route.fuel_type ? checkpoint.route.fuel_type : null  // Ensure fuel_type is fetched correctly
    }));
};
const getCheckpointById = async (id: number) => {
    const response = await API.get(`/routecheckpoints/${id}/`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
const markCheckpointDelivered = async (checkpointId: number, stationId: number, fuelTypeName: string, quantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("Token not found");
    }
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const data = {
        station_id: stationId,
        fuel_type_name: fuelTypeName,
        quantity: quantity
    };
    console.log("Data being sent to deliver endpoint:", data);
    console.log("Headers being sent:", headers);  // Log headers to verify
    const response = await axios.post(`http://127.0.0.1:8002/api/routecheckpoints/${checkpointId}/deliver/`, data, { headers });
    return response.data;
};
export default {
    getTrucks,
    createTruck,
    updateTruck,
    deleteTruck,
    getDrivers,
    getTruckLocation,
    getCheckpointsByRoute,
    markCheckpointDelivered,
    getCheckpointById
};
