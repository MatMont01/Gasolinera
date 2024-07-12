import React, {useEffect, useState} from 'react';
import fuelTypeService from '../services/fuelTypeService';
import {Link} from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';
import {Oval} from 'react-loader-spinner';

const ManageFuelTypesPage: React.FC = () => {
    const [fuelTypes, setFuelTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchFuelTypes = async () => {
            try {
                const fuelTypeData = await fuelTypeService.getFuelTypes();
                setFuelTypes(fuelTypeData);
            } catch (error) {
                console.error('Error fetching fuel types:', error);
                setErrorMessage('Failed to fetch fuel types');
                setTimeout(() => setErrorMessage(null), 3000);
            } finally {
                setLoading(false);
            }
        };
        fetchFuelTypes();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await fuelTypeService.deleteFuelType(id);
            setFuelTypes(fuelTypes.filter(fuelType => fuelType.id !== id));
            setSuccessMessage('Fuel Type deleted successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Failed to delete fuel type", error);
            setErrorMessage('Failed to delete fuel type');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen p-8 text-white">
            <h1 className="text-3xl font-semibold mb-8">Manage Fuel Types</h1>
            <Link to={ROUTES.CREATE_FUEL_TYPE} className="bg-green-500 py-2 px-4 rounded hover:bg-green-700">
                Create Fuel Type
            </Link>
            {loading && (
                <div className="flex justify-center mt-4">
                    <Oval height={50} width={50} color="#4fa94d" ariaLabel="loading"/>
                </div>
            )}
            {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
            {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
            <ul className="mt-8 space-y-4">
                {fuelTypes.map((fuelType) => (
                    <li key={fuelType.id}
                        className="bg-gray-800 p-4 rounded shadow-md flex justify-between items-center">
                        <span>{fuelType.name}</span>
                        <button
                            onClick={() => handleDelete(fuelType.id)}
                            className="bg-red-500 py-2 px-4 rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageFuelTypesPage;
