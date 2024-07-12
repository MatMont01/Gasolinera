import {API} from './api';

const getFuelStocks = async () => {
    const response = await API.get('/fuelstocks/');
    return response.data;
};

const getFuelStockById = async (id: string) => {
    const response = await API.get(`/fuelstocks/${id}/`);
    return response.data;
};


export default {
    getFuelStocks,
    getFuelStockById
};
