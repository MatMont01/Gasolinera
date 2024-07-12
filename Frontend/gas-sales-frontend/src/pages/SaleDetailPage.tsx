import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import salesService from '../services/salesService';
import {Oval} from 'react-loader-spinner';

const SaleDetailPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const saleData = await salesService.getSaleById(Number(id));
                setSale(saleData);
            } catch (error) {
                console.error('Error fetching sale data:', error);
                setErrorMessage('Failed to fetch sale data');
                setTimeout(() => setErrorMessage(null), 3000);
            } finally {
                setLoading(false);
            }
        };
        fetchSale();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
                <Oval height={50} width={50} color="#4fa94d" ariaLabel="loading"/>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen p-8 text-white">
            <h1 className="text-3xl font-semibold mb-8">Sale Details</h1>
            {sale ? (
                <div className="bg-gray-800 p-6 rounded-md shadow-md">
                    <p className="mb-2"><strong>Invoice Name:</strong> {sale.invoice_name}</p>
                    <p className="mb-2"><strong>Invoice NIT:</strong> {sale.invoice_nit}</p>
                    <p className="mb-2"><strong>Customer:</strong> {sale.customer}</p>
                    <p className="mb-2"><strong>Email:</strong> {sale.email}</p>
                    <p className="mb-2"><strong>Amount:</strong> {sale.amount}</p>
                    <p className="mb-2"><strong>Current Price:</strong> {sale.current_price}</p>
                    <p className="mb-2"><strong>Quantity:</strong> {sale.quantity}</p>
                    <p className="mb-2"><strong>Date and Time:</strong> {new Date(sale.date_time).toLocaleString()}</p>
                    <p className="mb-2"><strong>Status:</strong> {sale.is_canceled ? 'Canceled' : 'Active'}</p>
                    <p className="mb-2"><strong>Fuel Type:</strong> {sale.fuel_type_name}</p>
                    <p className="mb-2"><strong>Pump:</strong> {sale.pump}</p>
                </div>
            ) : (
                <div className="text-red-500">No sale data available</div>
            )}
            {errorMessage && <div className="text-red-500 mt-4">{errorMessage}</div>}
        </div>
    );
};

export default SaleDetailPage;
