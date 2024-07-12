// ManageTrucksPage.tsx

import React, { useState, useEffect } from 'react';
import truckService from '../services/truckService';
import { NavLink } from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';

const ManageTrucksPage: React.FC = () => {
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrucks = async () => {
            try {
                const data = await truckService.getTrucks();
                setTrucks(data);
            } catch (err) {
                setError('Failed to load trucks');
            } finally {
                setLoading(false);
            }
        };
        fetchTrucks();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await truckService.deleteTruck(id);
            setTrucks(trucks.filter((truck: any) => truck.id !== id));
        } catch (err) {
            setError('Failed to delete truck');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Trucks</h1>
            <NavLink to={ROUTES.CREATE_TRUCK} className="inline-block px-4 py-2 mb-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create New Truck
            </NavLink>
            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : (
                <ul className="space-y-4">
                    {trucks.map((truck: any) => (
                        <li key={truck.id} className="p-4 bg-gray-800 rounded-md shadow-sm">
                            <p>
                                <span className="font-medium">Plate:</span> {truck.plate} -
                                <span className="font-medium"> Driver ID:</span> {truck.driver_id ? truck.driver_id : 'No Driver'} -
                                <span className="font-medium"> Lat:</span> {truck.latitude} -
                                <span className="font-medium"> Lng:</span> {truck.longitude}
                            </p>
                            <div className="mt-2 space-x-2">
                                <NavLink to={`${ROUTES.EDIT_TRUCK.replace(':id', String(truck.id))}`} className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Edit
                                </NavLink>
                                <button onClick={() => handleDelete(truck.id)} className="px-3 py-1 text-sm text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageTrucksPage;
