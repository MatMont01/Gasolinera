// SolicitudForm.tsx

import React, { useState, useEffect } from 'react';
import solicitudService from '../services/solicitudService';
import fuelTypeService from '../services/fuelTypeService';

interface SolicitudFormProps {
    solicitud?: any;
    onSave: () => void;
}

const SolicitudForm: React.FC<SolicitudFormProps> = ({ solicitud, onSave }) => {
    const [formData, setFormData] = useState(solicitud || { station_id: '', pump_id: '', fuel_type: '' });
    const [fuelTypes, setFuelTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFuelTypes = async () => {
            const fuelTypesData = await fuelTypeService.getFuelTypes();
            setFuelTypes(fuelTypesData);
        };
        fetchFuelTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (solicitud) {
                await solicitudService.updateSolicitud(solicitud.id, formData);
            } else {
                await solicitudService.createSolicitud(formData);
            }
            onSave();
        } catch (err) {
            setError('Failed to save solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Station ID</label>
                <input type="number" name="station_id" value={formData.station_id} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-300">Pump ID</label>
                <input type="number" name="pump_id" value={formData.pump_id} onChange={handleChange} required className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-gray-300" />
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
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900">
                {loading ? 'Saving...' : 'Save'}
            </button>
        </form>
    );
};

export default SolicitudForm;
