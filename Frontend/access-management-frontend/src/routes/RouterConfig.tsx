import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLoaderData } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ManageUsersPage from '../pages/ManageUsersPage';
import ManageStationsPage from '../pages/ManageStationsPage';
import UserForm from '../components/UserForm';
import StationForm from '../components/StationForm';
import Layout from '../components/Layout';
import ROUTES from './CONSTANTS';
import { useAuth } from '../context/AuthContext';
import stationService from '../services/stationService';

const fetchStations = async () => {
    return await stationService.getStations();
};

const UserFormWithStations = () => {
    const stations = useLoaderData();
    return <UserForm stations={stations} onSave={() => {}} />;
};

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { user } = useAuth();
    return user?.access ? element : <Navigate to={ROUTES.LOGIN} />;
};

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: ROUTES.HOME,
                element: <HomePage />,
            },
            {
                path: ROUTES.LOGIN,
                element: <LoginPage />,
            },
            {
                path: ROUTES.MANAGE_USERS,
                element: <ProtectedRoute element={<ManageUsersPage />} />,
            },
            {
                path: ROUTES.MANAGE_STATIONS,
                element: <ProtectedRoute element={<ManageStationsPage />} />,
            },
            {
                path: ROUTES.CREATE_USER,
                element: <ProtectedRoute element={<UserFormWithStations />} />,
                loader: fetchStations,
            },
            {
                path: ROUTES.EDIT_USER,
                element: <ProtectedRoute element={<UserFormWithStations />} />,
                loader: fetchStations,
            },
            {
                path: ROUTES.CREATE_STATION,
                element: <ProtectedRoute element={<StationForm onSave={() => {}} />} />,
            },
            {
                path: ROUTES.EDIT_STATION,
                element: <ProtectedRoute element={<StationForm onSave={() => {}} />} />,
            },
        ],
    },
]);

const RouterConfig: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default RouterConfig;
