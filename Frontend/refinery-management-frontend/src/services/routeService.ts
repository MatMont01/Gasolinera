import { API } from './api';

const getRoutes = async () => {
    const response = await API.get('/routes/');
    return response.data;
};

const createRoute = async (routeData: any) => {
    const response = await API.post('/routes/', routeData);
    return response.data;
};

const updateRoute = async (id: number, routeData: any) => {
    const response = await API.patch(`/routes/${id}/`, routeData);
    return response.data;
};

const deleteRoute = async (id: number) => {
    const response = await API.delete(`/routes/${id}/`);
    return response.data;
};

const getRoutesByTruckId = async (truckId: string) => {
    const response = await API.get(`/routes?truck=${truckId}`);
    return response.data;
};

const getRouteByDriver = async (driverEmail: string) => {
    const response = await API.get(`/routes?driver=${driverEmail}`);
    return response.data;
};

export default {
    getRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    getRoutesByTruckId,
    getRouteByDriver,
};
