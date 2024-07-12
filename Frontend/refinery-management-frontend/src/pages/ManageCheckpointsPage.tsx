// ManageCheckpointsPage.tsx

import React, { useState, useEffect } from 'react';
import checkpointService from '../services/checkpointService';
import stationService from '../services/stationService';
import routeService from '../services/routeService';
import { NavLink, useNavigate } from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';

const ManageCheckpointsPage: React.FC = () => {
    const [checkpoints, setCheckpoints] = useState([]);
    const [stations, setStations] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const checkpointsData = await checkpointService.getCheckpoints();
                const stationsData = await stationService.getStations();
                const routesData = await routeService.getRoutes();
                setCheckpoints(checkpointsData);
                setStations(stationsData);
                setRoutes(routesData);
            } catch (err) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await checkpointService.deleteCheckpoint(id);
            setCheckpoints(checkpoints.filter((checkpoint: any) => checkpoint.id !== id));
        } catch (err) {
            setError('Failed to delete checkpoint');
        }
    };

    const handleEdit = (id: number) => {
        navigate(ROUTES.EDIT_CHECKPOINT.replace(':id', String(id)));
    };

    const handleMarkAsDelivered = async (id: number) => {
        try {
            await checkpointService.markAsDelivered(id);
            setCheckpoints(
                checkpoints.map((checkpoint: any) =>
                    checkpoint.id === id ? { ...checkpoint, delivered: true } : checkpoint
                )
            );
        } catch (err) {
            setError('Failed to mark as delivered');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Checkpoints</h1>
            <NavLink to={ROUTES.CREATE_CHECKPOINT} className="inline-block px-4 py-2 mb-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create New Checkpoint
            </NavLink>
            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : (
                <ul className="space-y-4">
                    {checkpoints.map((checkpoint: any) => (
                        <li key={checkpoint.id} className="p-4 bg-gray-800 rounded-md shadow-sm">
                            <p>
                                <span className="font-medium">Station:</span> {stations.find((station: any) => station.id === checkpoint.station_id)?.name} -
                                <span className="font-medium"> Route:</span> {routes.find((route: any) => route.id === checkpoint.route)?.name} -
                                <span className="font-medium">{checkpoint.delivered ? 'Delivered' : 'Pending'}</span>
                            </p>
                            <div className="mt-2 space-x-2">
                                <button onClick={() => handleEdit(checkpoint.id)} className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(checkpoint.id)} className="px-3 py-1 text-sm text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    Delete
                                </button>
                                {!checkpoint.delivered && (
                                    <button onClick={() => handleMarkAsDelivered(checkpoint.id)} className="px-3 py-1 text-sm text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageCheckpointsPage;
