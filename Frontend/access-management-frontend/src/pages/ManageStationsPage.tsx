import React, { useState, useEffect } from 'react';
import stationService from '../services/stationService';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ThreeDots } from 'react-loader-spinner';

const ManageStationsPage: React.FC = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = async () => {
        setLoading(true);
        const data = await stationService.getStations();
        setStations(data);
        setLoading(false);
    };

    const handleEdit = (stationId: string) => {
        navigate(`/edit-station/${stationId}`);
    };

    const handleDelete = async (stationId: string) => {
        setLoading(true);
        await stationService.deleteStation(stationId);
        loadStations();
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-3xl font-bold mb-6">Manage Stations</h2>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <ThreeDots height="80" width="80" color="red" ariaLabel="loading" />
                </div>
            ) : (
                <ul className="space-y-4">
                    {stations.map((station: any) => (
                        <li key={station.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-md shadow-md">
                            <div>
                                <p className="text-lg font-medium">{station.name}</p>
                                <p className="text-sm text-gray-400">{station.location}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={() => handleEdit(station.id)} text="Edit" />
                                <Button onClick={() => handleDelete(station.id)} text="Delete" color="red" />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageStationsPage;
