// TruckForm.tsx

import React, { useState, useEffect } from 'react';
import truckService from '../services/truckService';

interface TruckFormProps {
    truck?: any;
    onSave: () => void;
}

const TruckForm: React.FC<TruckFormProps> = ({ truck, onSave }) => {
    const [formData, setFormData] = useState(truck || { plate: '', driver_id: '', latitude: '', longitude: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const data = await truckService.getDrivers();
                setDrivers(data);
            } catch (err) {
                setError('Failed to load drivers');
            }
        };
        fetchDrivers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (truck) {
                await truckService.updateTruck(truck.id, formData);
            } else {
                await truckService.createTruck(formData);
            }
            onSave();
        } catch (err) {
            setError('Failed to save truck');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Plate</label>
                <input
                    type="text"
                    name="plate"
                    value={formData.plate}
                    onChange={handleChange}
                    required
                    className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                />
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Driver</label>
                <select
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleChange}
                    required
                    className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                >
                    <option value="">Select Driver</option>
                    {drivers.map((driver: any) => (
                        <option key={driver.id} value={driver.id}>
                            {driver.username}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Latitude</label>
                <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.000001"
                    required
                    className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                />
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Longitude</label>
                <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.000001"
                    required
                    className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
            >
                {loading ? 'Saving...' : 'Save'}
            </button>
        </form>
    );
};

export default TruckForm;
