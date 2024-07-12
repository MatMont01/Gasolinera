import React, { useEffect, useState } from 'react';
import pumpService from '../services/pumpService';
import { Link } from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';
import { Oval } from 'react-loader-spinner';

const ManagePumpsPage: React.FC = () => {
    const [pumps, setPumps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchPumps = async () => {
            try {
                const pumpData = await pumpService.getPumps();
                setPumps(pumpData);
            } catch (error) {
                console.error('Error fetching pumps:', error);
                setErrorMessage('Failed to fetch pumps');
                setTimeout(() => setErrorMessage(null), 3000);
            } finally {
                setLoading(false);
            }
        };
        fetchPumps();
    }, []);

    const handleDeletePump = async (pumpId: string) => {
        setLoading(true);
        try {
            await pumpService.deletePump(pumpId);
            setPumps(pumps.filter(pump => pump.id !== pumpId));
            setSuccessMessage('Pump deleted successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error deleting pump:', error);
            setErrorMessage('Failed to delete pump');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen p-8 text-white">
            <h1 className="text-3xl font-semibold mb-8">Manage Pumps</h1>
            <Link to={ROUTES.CREATE_PUMP} className="bg-green-500 py-2 px-4 rounded hover:bg-green-700">
                Create Pump
            </Link>
            {loading && (
                <div className="flex justify-center mt-4">
                    <Oval height={50} width={50} color="#4fa94d" ariaLabel="loading" />
                </div>
            )}
            {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
            {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
            <ul className="mt-8">
                {pumps.map((pump) => (
                    <li key={pump.id} className="mb-4 p-4 bg-gray-800 rounded shadow-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-semibold">Code: </span>{pump.code} <br />
                                <span className="font-semibold">Station: </span>{pump.station}
                            </div>
                            <div>
                                <Link
                                    to={`${ROUTES.EDIT_PUMP.replace(':id', pump.id)}`}
                                    className="bg-blue-500 py-2 px-4 rounded mr-2 hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDeletePump(pump.id)}
                                    className="bg-red-500 py-2 px-4 rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManagePumpsPage;
