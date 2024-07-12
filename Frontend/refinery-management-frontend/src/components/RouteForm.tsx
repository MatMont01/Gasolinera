// RouteForm.tsx

import React, { useState, useEffect } from 'react';
import routeService from '../services/routeService';
import truckService from '../services/truckService';
import fuelTypeService from '../services/fuelTypeService';

interface RouteFormProps {
    route?: any;
    onSave: () => void;
}

const RouteForm: React.FC<RouteFormProps> = ({ route, onSave }) => {
    const [formData, setFormData] = useState(route || { truck: '', date: '', name: '', fuel_type: '', liters: '' });
    const [trucks, setTrucks] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrucks = async () => {
            const trucksData = await truckService.getTrucks();
            setTrucks(trucksData);
        };
        const fetchFuelTypes = async () => {
            const fuelTypesData = await fuelTypeService.getFuelTypes();
            setFuelTypes(fuelTypesData);
        };
        fetchTrucks();
        fetchFuelTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (route) {
                await routeService.updateRoute(route.id, formData);
            } else {
                await routeService.createRoute(formData);
            }
            onSave();
        } catch (err) {
            setError('Failed to save route');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Truck</label>
                <select name="truck" value={formData.truck} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300">
                    <option value="">Select Truck</option>
                    {trucks.map((truck: any) => (
                        <option key={truck.id} value={truck.id}>
                            {truck.plate}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Fuel Type</label>
                <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300">
                    <option value="">Select Fuel Type</option>
                    {fuelTypes.map((fuelType: any) => (
                        <option key={fuelType.id} value={fuelType.id}>
                            {fuelType.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Liters</label>
                <input type="number" name="liters" value={formData.liters} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900">
                {loading ? 'Saving...' : 'Save'}
            </button>
        </form>
    );
};

export default RouteForm;
