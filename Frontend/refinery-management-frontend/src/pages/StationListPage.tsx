// StationListPage.tsx
import React, { useEffect, useState } from 'react';
import stationService from '../services/stationService';

const StationListPage: React.FC = () => {
    const [stations, setStations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const stationsData = await stationService.getStations();
                const stationsWithStocks = await Promise.all(stationsData.map(async (station: any) => {
                    try {
                        const stockData = await stationService.getStationStocks(station.id);
                        return { ...station, fuel_stocks: stockData };
                    } catch (err) {
                        console.error(`Failed to fetch stock for station ${station.id}`, err);
                        return { ...station, fuel_stocks: [] };
                    }
                }));
                setStations(stationsWithStocks);
            } catch (error) {
                setError('Failed to fetch stations');
            }
        };

        fetchStations();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Station List</h1>
            {error && <p className="text-red-500">{error}</p>}
            <ul className="space-y-4">
                {stations.map(station => (
                    <li key={station.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold">{station.name}</h2>
                        <p className="mt-2">Location: {station.latitude}, {station.longitude}</p>
                        <p className="mt-4 font-medium">Fuel Stocks:</p>
                        <ul className="mt-2 space-y-1">
                            {station.fuel_stocks.map((stock: any) => (
                                <li key={stock.id} className="text-gray-300">
                                    <span className="font-semibold">{stock.fuel_type.name}:</span> {stock.quantity}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StationListPage;
