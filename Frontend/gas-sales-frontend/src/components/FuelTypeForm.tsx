import React, { useEffect, useState } from 'react';
import fuelTypeService from '../services/fuelTypeService';
import stationsService from '../services/stationsService';
import { Oval } from 'react-loader-spinner';

const FuelTypeForm: React.FC = () => {
    const [name, setName] = useState('');
    const [initialQuantity, setInitialQuantity] = useState('');
    const [stations, setStations] = useState<any[]>([]);
    const [selectedStations, setSelectedStations] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const stationsData = await stationsService.getStations();
                setStations(stationsData);
            } catch (error) {
                console.error('Error fetching stations:', error);
            }
        };

        fetchStations();
    }, []);

    const handleCheckboxChange = (stationId: number) => {
        setSelectedStations(prevSelected =>
            prevSelected.includes(stationId)
                ? prevSelected.filter(id => id !== stationId)
                : [...prevSelected, stationId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newFuelType = { name, stations: selectedStations, initial_quantity: initialQuantity };
            await fuelTypeService.createFuelType(newFuelType);
            setSuccessMessage('Fuel Type created successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error creating fuel type:', error);
            setErrorMessage('Failed to create fuel type');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-md shadow-md">
            {loading && (
                <div className="flex justify-center mb-4">
                    <Oval height={50} width={50} color="#4fa94d" ariaLabel="loading" />
                </div>
            )}
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Initial Quantity (liters):</label>
                <input
                    type="number"
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(e.target.value)}
                    required
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Stations:</label>
                {stations.map(station => (
                    <div key={station.id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            value={station.id}
                            onChange={() => handleCheckboxChange(station.id)}
                            checked={selectedStations.includes(station.id)}
                            className="mr-2"
                        />
                        <label className="text-gray-300">{station.name}</label>
                    </div>
                ))}
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
                Create Fuel Type
            </button>
            {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
            {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
        </form>
    );
};

export default FuelTypeForm;
