import React, {useState, useEffect} from 'react';
import pumpService from '../services/pumpService';
import stationsService from '../services/stationsService';
import {useParams} from 'react-router-dom';
import {Oval} from 'react-loader-spinner';

const PumpForm: React.FC<{ pump?: any, onSave: () => void }> = ({pump, onSave}) => {
    const [formData, setFormData] = useState(pump || {
        code: '',
        station: '',
        fuel_types: [],
    });

    const [stations, setStations] = useState<any[]>([]);
    const [fuelTypes, setFuelTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const {id} = useParams<{ id: string }>();

    useEffect(() => {
        const fetchStations = async () => {
            const stationData = await stationsService.getStations();
            setStations(stationData);
            setLoading(false);
        };
        fetchStations();

        const fetchFuelTypes = async () => {
            const fuelTypesData = await pumpService.getFuelTypes();
            setFuelTypes(fuelTypesData);
        };
        fetchFuelTypes();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchPump = async () => {
                const pumpData = await pumpService.getPumpById(id);
                setFormData(pumpData);
            };
            fetchPump();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value, checked} = e.target;
        setFormData((prevFormData: typeof formData) => {
            const updatedFuelTypes = checked
                ? [...prevFormData.fuel_types, parseInt(value)]
                : prevFormData.fuel_types.filter((type: number) => type !== parseInt(value));
            return {...prevFormData, fuel_types: updatedFuelTypes};
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await pumpService.updatePump(id, formData);
            } else {
                await pumpService.createPump(formData);
            }
            setSuccessMessage('Pump saved successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
            onSave();
        } catch (error) {
            console.error("Failed to save the pump", error);
            setErrorMessage('Failed to save the pump');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-4">
                <Oval height={50} width={50} color="#4fa94d" ariaLabel="loading"/>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-md shadow-md">
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Code</label>
                <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Station</label>
                <select
                    name="station"
                    value={formData.station}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                >
                    <option value="">Select Station</option>
                    {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                            {station.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Fuel Types</label>
                {fuelTypes.map((type) => (
                    <div key={type.id} className="mb-2">
                        <input
                            type="checkbox"
                            id={`fuel_type_${type.id}`}
                            name="fuel_types"
                            value={type.id}
                            checked={formData.fuel_types.includes(type.id)}
                            onChange={handleCheckboxChange}
                            className="mr-2"
                        />
                        <label htmlFor={`fuel_type_${type.id}`} className="text-gray-300">{type.name}</label>
                    </div>
                ))}
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
                Save
            </button>
            {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
            {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
        </form>
    );
};

export default PumpForm;
