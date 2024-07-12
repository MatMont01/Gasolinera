import React, {useEffect, useState} from 'react';
import fuelStockService from '../services/fuelStockService';

const ManageFuelStocksPage: React.FC = () => {
    const [fuelStocks, setFuelStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFuelStocks = async () => {
            try {
                const fuelStockData = await fuelStockService.getFuelStocks();
                console.log('Fetched Fuel Stocks:', fuelStockData);
                setFuelStocks(fuelStockData);
            } catch (error) {
                console.error('Error fetching fuel stocks:', error);
                setError('Failed to fetch fuel stocks');
            } finally {
                setLoading(false);
            }
        };
        fetchFuelStocks();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-300">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-900 min-h-screen p-8 text-white">
            <h1 className="text-3xl font-semibold mb-8">Manage Fuel Stocks</h1>
            <ul className="space-y-4">
                {fuelStocks.map((fuelStock) => (
                    <li key={fuelStock.id}
                        className="bg-gray-800 p-4 rounded shadow-md flex justify-between items-center">
                        <span>{fuelStock.station.name} - {fuelStock.fuel_type.name} - {fuelStock.quantity} liters</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageFuelStocksPage;
