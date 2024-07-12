// ManageSolicitudesPage.tsx

import React, { useState, useEffect } from 'react';
import solicitudService from '../services/solicitudService';
import { NavLink } from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';

const ManageSolicitudesPage: React.FC = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const data = await solicitudService.getSolicitudes();
                setSolicitudes(data);
            } catch (err) {
                setError('Failed to load solicitudes');
            } finally {
                setLoading(false);
            }
        };
        fetchSolicitudes();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await solicitudService.deleteSolicitud(id);
            setSolicitudes(solicitudes.filter((solicitud: any) => solicitud.id !== id));
        } catch (err) {
            setError('Failed to delete solicitud');
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await solicitudService.approveSolicitud(id);
            setSolicitudes(
                solicitudes.map((solicitud: any) =>
                    solicitud.id === id ? { ...solicitud, approved: true } : solicitud
                )
            );
        } catch (err) {
            setError('Failed to approve solicitud');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Solicitudes</h1>
            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : (
                <ul className="space-y-4">
                    {solicitudes.map((solicitud: any) => (
                        <li key={solicitud.id} className="p-4 bg-gray-800 rounded-md shadow-sm">
                            <p>
                                <span className="font-medium">Station ID:</span> {solicitud.station_id} -
                                <span className="font-medium"> Pump ID:</span> {solicitud.pump_id} -
                                <span className="font-medium">{solicitud.approved ? 'Approved' : 'Pending'}</span>
                            </p>
                            <div className="mt-2 space-x-2">
                                {!solicitud.approved && (
                                    <button
                                        onClick={() => handleApprove(solicitud.id)}
                                        className="px-3 py-1 text-sm text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Approve
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(solicitud.id)}
                                    className="px-3 py-1 text-sm text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
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

export default ManageSolicitudesPage;
