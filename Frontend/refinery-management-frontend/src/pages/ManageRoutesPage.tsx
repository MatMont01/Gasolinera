// ManageRoutesPage.tsx

import React, { useState, useEffect } from 'react';
import routeService from '../services/routeService';
import { NavLink } from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';

const ManageRoutesPage: React.FC = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await routeService.getRoutes();
                setRoutes(data);
            } catch (err) {
                setError('Failed to load routes');
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await routeService.deleteRoute(id);
            setRoutes(routes.filter((route: any) => route.id !== id));
        } catch (err) {
            setError('Failed to delete route');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Routes</h1>
            <NavLink to={ROUTES.CREATE_ROUTE} className="inline-block px-4 py-2 mb-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Create New Route
            </NavLink>
            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : (
                <ul className="space-y-4">
                    {routes.map((route: any) => (
                        <li key={route.id} className="p-4 bg-gray-800 rounded-md shadow-sm">
                            <p>
                                <span className="font-medium">{route.name}</span> - <span className="font-medium">{route.date}</span>
                            </p>
                            <div className="mt-2 space-x-2">
                                <NavLink to={`${ROUTES.EDIT_ROUTE.replace(':id', String(route.id))}`} className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Edit
                                </NavLink>
                                <button onClick={() => handleDelete(route.id)} className="px-3 py-1 text-sm text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
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

export default ManageRoutesPage;
