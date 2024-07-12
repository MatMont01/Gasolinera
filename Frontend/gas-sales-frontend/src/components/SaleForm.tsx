import React, { useState, useEffect } from 'react';
import salesService from '../services/salesService';
import stationsService from '../services/stationsService';
import { Oval } from 'react-loader-spinner';

const SaleForm: React.FC<{ sale?: any, onSave: () => void }> = ({ sale, onSave }) => {
    const [formData, setFormData] = useState(sale || {
        invoice_name: '',
        invoice_nit: '',
        customer: '',
        email: '',
        quantity: '',
        station: '',
        fuel_type: '',
        pump: '',
    });

    const [stations, setStations] = useState<any[]>([]);
    const [fuelTypes, setFuelTypes] = useState<any[]>([]);
    const [pumps, setPumps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const stationsData = await stationsService.getStations();
                setStations(stationsData);
            } catch (error) {
                console.error("Failed to fetch stations", error);
                setErrorMessage('Failed to fetch stations');
            } finally {
                setLoading(false);
            }
        };
        fetchStations();
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            if (formData.station) {
                try {
                    const fuelTypesData = await stationsService.getFuelTypesByStation(formData.station);
                    setFuelTypes(fuelTypesData);
                    const pumpsData = await stationsService.getPumpsByStation(formData.station);
                    setPumps(pumpsData);
                } catch (error) {
                    console.error("Failed to fetch fuel types or pumps", error);
                    setErrorMessage('Failed to fetch fuel types or pumps');
                }
            }
        };
        fetchDetails();
    }, [formData.station]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fuelType = fuelTypes.find(ft => ft.id === parseInt(formData.fuel_type));
            if (!fuelType) {
                throw new Error("Fuel type not found");
            }
            const saleData = {
                ...formData,
                fuel_type: fuelType.name,
                quantity: parseFloat(formData.quantity),
            };
            console.log('Sale Data:', saleData);
            await salesService.createSale(saleData);
            setSuccessMessage('Sale saved successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
            onSave();
        } catch (error) {
            console.error("Failed to save the sale", error);
            setErrorMessage('Failed to save the sale');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-4">
                <Oval height={50} width={50} color="#4fa94d" ariaLabel="loading" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-md shadow-md">
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Invoice Name</label>
                <input
                    type="text"
                    name="invoice_name"
                    value={formData.invoice_name}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Invoice NIT</label>
                <input
                    type="text"
                    name="invoice_nit"
                    value={formData.invoice_nit}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Customer</label>
                <input
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Quantity</label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
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
                <label className="block text-gray-300 mb-2">Fuel Type</label>
                <select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                >
                    <option value="">Select Fuel Type</option>
                    {fuelTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">Pump</label>
                <select
                    name="pump"
                    value={formData.pump}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                >
                    <option value="">Select Pump</option>
                    {pumps.map((pump) => (
                        <option key={pump.id} value={pump.id}>
                            {pump.code}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
                Save
            </button>
            {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
            {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
        </form>
    );
};

export default SaleForm;
