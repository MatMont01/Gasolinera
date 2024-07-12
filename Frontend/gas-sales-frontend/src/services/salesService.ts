import { API } from './api';

const getSales = async () => {
    const response = await API.get('/sales/');
    return response.data;
};

const getSaleById = async (id: number) => {
    const response = await API.get(`/sales/${id}/`);
    return response.data;
};

const createSale = async (saleData: any) => {
    const response = await API.post('/sales/', saleData);
    return response.data;
};

const deleteSale = async (id: number) => {
    const response = await API.delete(`/sales/${id}/`);
    return response.data;
};

const cancelSale = async (id: number) => {
    const response = await API.post(`/sales/${id}/cancel_sale/`);
    return response.data;
};

export default {
    getSales,
    getSaleById,
    createSale,
    deleteSale,
    cancelSale
};
