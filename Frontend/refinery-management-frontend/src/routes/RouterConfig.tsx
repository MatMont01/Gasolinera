import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ManageTrucksPage from '../pages/ManageTrucksPage';
import TruckForm from '../components/TruckForm';
import ManageRoutesPage from '../pages/ManageRoutesPage';
import RouteForm from '../components/RouteForm';
import ManageCheckpointsPage from '../pages/ManageCheckpointsPage';
import CheckpointForm from '../components/CheckpointForm';
import ManageSolicitudesPage from '../pages/ManageSolicitudesPage';
import SolicitudForm from '../components/SolicitudForm';
import DashboardPage from '../pages/DashboardPage';
import Layout from '../components/Layout';
import ROUTES from './CONSTANTS';
import { useAuth } from '../context/AuthContext';
import MapPage from "../pages/MapPage.tsx";
import StationListPage from "../pages/StationListPage.tsx";

const ProtectedRoute: React.FC<{ element: React.ReactElement, role?: string }> = ({ element, role }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to={ROUTES.LOGIN} />;
    }
    if (role && user.role !== role) {
        return <Navigate to={ROUTES.HOME} />;
    }
    return element;
};

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: ROUTES.HOME, element: <HomePage /> },
            { path: ROUTES.LOGIN, element: <LoginPage /> },
            { path: ROUTES.DASHBOARD, element: <ProtectedRoute element={<DashboardPage />} /> },
            { path: ROUTES.MANAGE_TRUCKS, element: <ProtectedRoute element={<ManageTrucksPage />} /> },
            { path: ROUTES.CREATE_TRUCK, element: <ProtectedRoute element={<TruckForm />} /> },
            { path: ROUTES.EDIT_TRUCK, element: <ProtectedRoute element={<TruckForm />} /> },
            { path: ROUTES.MANAGE_ROUTES, element: <ProtectedRoute element={<ManageRoutesPage />} /> },
            { path: ROUTES.CREATE_ROUTE, element: <ProtectedRoute element={<RouteForm />} /> },
            { path: ROUTES.EDIT_ROUTE, element: <ProtectedRoute element={<RouteForm />} /> },
            { path: ROUTES.MANAGE_CHECKPOINTS, element: <ProtectedRoute element={<ManageCheckpointsPage />} /> },
            { path: ROUTES.CREATE_CHECKPOINT, element: <ProtectedRoute element={<CheckpointForm />} /> },
            { path: ROUTES.EDIT_CHECKPOINT, element: <ProtectedRoute element={<CheckpointForm />} /> },
            { path: ROUTES.MANAGE_SOLICITUDES, element: <ProtectedRoute element={<ManageSolicitudesPage />} /> },
            { path: ROUTES.CREATE_SOLICITUD, element: <ProtectedRoute element={<SolicitudForm />} /> },
            { path: ROUTES.EDIT_SOLICITUD, element: <ProtectedRoute element={<SolicitudForm />} /> },
            { path: ROUTES.MAP, element: <ProtectedRoute element={<MapPage />} /> },
            { path: ROUTES.STATIONS, element: <StationListPage /> },
        ],
    },
]);

const RouterConfig: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default RouterConfig;
