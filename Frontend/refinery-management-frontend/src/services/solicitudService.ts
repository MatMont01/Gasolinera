// src/services/solicitudService.ts
import {API} from './api';

const getSolicitudes = async () => {
    const response = await API.get('/solicitudes/');
    return response.data;
};

const createSolicitud = async (solicitudData: any) => {
    const response = await API.post('/solicitudes/', solicitudData);
    return response.data;
};

const approveSolicitud = async (id: number) => {
    const response = await API.post(`/solicitudes/${id}/approve/`);
    return response.data;
};

const deleteSolicitud = async (id: number) => {
    const response = await API.delete(`/solicitudes/${id}/`);
    return response.data;
};
const updateSolicitud = async (id: number, solicitudData: any) => {
    const response = await API.patch(`/solicitudes/${id}/`, solicitudData);
    return response.data;

}

export default {
    getSolicitudes,
    createSolicitud,
    approveSolicitud,
    deleteSolicitud,
    updateSolicitud
};
