// CheckpointForm.tsx

import React, { useState, useEffect } from 'react';
import checkpointService from '../services/checkpointService';
import routeService from '../services/routeService';
import stationService from '../services/stationService';
import { useParams } from 'react-router-dom';

const CheckpointForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState({ route: '', station_id: '', liters_delivered: '', latitude: '', longitude: '' });
    const [routes, setRoutes] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const routesData = await routeService.getRoutes();
                setRoutes(routesData);
            } catch (err) {
                setError('Failed to load routes');
            }
        };

        const fetchStations = async () => {
            try {
                const stationsData = await stationService.getStations();
                setStations(stationsData);
            } catch (err) {
                setError('Failed to load stations');
            }
        };

        fetchRoutes();
        fetchStations();

        if (id) {
            const fetchCheckpoint = async () => {
                try {
                    const checkpointData = await checkpointService.getCheckpointById(parseInt(id, 10));
                    setFormData({
                        route: checkpointData.route,
                        station_id: checkpointData.station_id,
                        liters_delivered: checkpointData.liters_delivered,
                        latitude: checkpointData.latitude,
                        longitude: checkpointData.longitude
                    });
                } catch (err) {
                    setError('Failed to load checkpoint');
                }
            };
            fetchCheckpoint();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stationId = e.target.value;
        setFormData({ ...formData, station_id: stationId });
        try {
            const stationData = await checkpointService.getStationLocation(stationId);
            setFormData((prevState) => ({
                ...prevState,
                latitude: stationData.latitude,
                longitude: stationData.longitude
            }));
        } catch (err) {
            setError('Failed to fetch station location');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (id) {
                await checkpointService.updateCheckpoint(parseInt(id, 10), formData);
            } else {
                await checkpointService.createCheckpoint(formData);
            }
            onSave();
        } catch (err) {
            console.error(err);
            setError('Failed to save checkpoint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Route</label>
                <select name="route" value={formData.route} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300">
                    <option value="">Select Route</option>
                    {routes.map((route: any) => (
                        <option key={route.id} value={route.id}>
                            {route.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Station</label>
                <select name="station_id" value={formData.station_id} onChange={handleStationChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300">
                    <option value="">Select Station</option>
                    {stations.map((station: any) => (
                        <option key={station.id} value={station.id}>
                            {station.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Liters Delivered</label>
                <input type="number" name="liters_delivered" value={formData.liters_delivered} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Latitude</label>
                <input type="text" name="latitude" value={formData.latitude} readOnly className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Longitude</label>
                <input type="text" name="longitude" value={formData.longitude} readOnly className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900">
                {loading ? 'Saving...' : 'Save'}
            </button>
        </form>
    );
};

export default CheckpointForm;
