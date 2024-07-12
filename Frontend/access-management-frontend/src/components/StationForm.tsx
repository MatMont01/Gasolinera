import React, { useState, useEffect } from 'react';
import stationService from '../services/stationService';
import { useNavigate, useParams } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';

const StationForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const [name, setName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [loading, setLoading] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const loadStation = async () => {
            if (id) {
                setLoading(true);
                const station = await stationService.getStationById(id);
                setName(station.name);
                setLatitude(station.latitude);
                setLongitude(station.longitude);
                setLoading(false);
            }
        };
        loadStation();
    }, [id]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = { name, latitude, longitude };
        setLoading(true);
        try {
            if (id) {
                await stationService.updateStation(id, data);
            } else {
                await stationService.createStation(data);
            }
            onSave();
            navigate('/stations');
        } catch (error) {
            console.error('Failed to submit form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <ThreeDots height="80" width="80" color="red" ariaLabel="loading" />
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="block text-gray-300">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300">Latitude</label>
                        <input
                            type="text"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            required
                            className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300">Longitude</label>
                        <input
                            type="text"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            required
                            className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={loading}>
                        {id ? 'Update' : 'Create'}
                    </button>
                </>
            )}
        </form>
    );
};

export default StationForm;
