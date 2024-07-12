import React, {useEffect, useState} from 'react';
import salesService from '../services/salesService';
import {Link} from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';
import {Oval} from 'react-loader-spinner';

const ManageSalesPage: React.FC = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const salesData = await salesService.getSales();
                setSales(salesData);
            } catch (error) {
                console.error('Error fetching sales:', error);
                setErrorMessage('Failed to fetch sales');
                setTimeout(() => setErrorMessage(null), 3000);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    const handleCancelSale = async (saleId: number) => {
        setLoading(true);
        try {
            await salesService.cancelSale(saleId);
            setSales(sales.map(sale => sale.id === saleId ? {...sale, is_canceled: true} : sale));
            setSuccessMessage('Sale canceled successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error canceling sale:', error);
            setErrorMessage('Failed to cancel sale');
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
        <div className="bg-gray-900 min-h-screen p-8 text-white">
            <h1 className="text-3xl font-semibold mb-8">Manage Sales</h1>
            <Link to={ROUTES.CREATE_SALE} className="bg-green-500 py-2 px-4 rounded hover:bg-green-700">
                Create Sale
            </Link>
            <ul className="mt-8 space-y-4">
                {sales.map((sale) => (
                    <li key={sale.id} className="bg-gray-800 p-4 rounded shadow-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <Link to={`${ROUTES.SALE_DETAIL.replace(':id', sale.id.toString())}`}
                                      className="text-blue-400 hover:underline">
                                    {sale.invoice_name} - {sale.amount} - {sale.is_canceled ? 'Canceled' : 'Active'}
                                </Link>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleCancelSale(sale.id)}
                                    className="bg-red-500 py-2 px-4 rounded hover:bg-red-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
            {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
        </div>
    );
};

export default ManageSalesPage;
