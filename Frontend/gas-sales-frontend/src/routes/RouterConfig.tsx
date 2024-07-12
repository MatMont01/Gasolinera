import React from 'react';
import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ManageSalesPage from '../pages/ManageSalesPage';
import SaleDetailPage from "../pages/SaleDetailPage.tsx";
import ManagePumpsPage from '../pages/ManagePumpsPage';
import ManageFuelTypesPage from '../pages/ManageFuelTypesPage';
import ManageFuelStocksPage from '../pages/ManageFuelStocksPage';
import DashboardPage from '../pages/DashboardPage'; // Asegúrate de que el DashboardPage esté importado
import SaleForm from '../components/SaleForm';
import PumpForm from '../components/PumpForm';
import FuelTypeForm from '../components/FuelTypeForm';
import Layout from '../components/Layout';
import ROUTES from './CONSTANTS';
import {useAuth} from '../context/AuthContext';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({element}) => {
    const {user} = useAuth();
    return user?.access ? element : <Navigate to={ROUTES.LOGIN}/>;
};

const router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                path: ROUTES.HOME,
                element: <HomePage/>,
            },
            {
                path: ROUTES.LOGIN,
                element: <LoginPage/>,
            },
            {
                path: ROUTES.DASHBOARD, // Añadir la ruta del Dashboard aquí
                element: <ProtectedRoute element={<DashboardPage/>}/>,
            },
            {
                path: ROUTES.MANAGE_SALES,
                element: <ProtectedRoute element={<ManageSalesPage/>}/>,
            },
            {
                path: ROUTES.SALE_DETAIL,
                element: <ProtectedRoute element={<SaleDetailPage/>}/>,
            },
            {
                path: ROUTES.CREATE_SALE,
                element: <ProtectedRoute element={<SaleForm onSave={() => {
                }}/>}/>,
            },
            {
                path: ROUTES.EDIT_SALE,
                element: <ProtectedRoute element={<SaleForm onSave={() => {
                }}/>}/>,
            },
            {
                path: ROUTES.MANAGE_PUMPS,
                element: <ProtectedRoute element={<ManagePumpsPage/>}/>,
            },
            {
                path: ROUTES.CREATE_PUMP,
                element: <ProtectedRoute element={<PumpForm onSave={() => {
                }}/>}/>,
            },
            {
                path: ROUTES.EDIT_PUMP,
                element: <ProtectedRoute element={<PumpForm onSave={() => {
                }}/>}/>,
            },
            {
                path: ROUTES.MANAGE_FUEL_TYPES,
                element: <ProtectedRoute element={<ManageFuelTypesPage/>}/>,
            },
            {
                path: ROUTES.CREATE_FUEL_TYPE,
                element: <ProtectedRoute element={<FuelTypeForm/>}/>,
            },
            {
                path: ROUTES.EDIT_FUEL_TYPE,
                element: <ProtectedRoute element={<FuelTypeForm/>}/>,
            },
            {
                path: ROUTES.MANAGE_FUEL_STOCKS,
                element: <ProtectedRoute element={<ManageFuelStocksPage/>}/>,
            },
        ],
    },
]);

const RouterConfig: React.FC = () => {
    return <RouterProvider router={router}/>;
};

export default RouterConfig;
