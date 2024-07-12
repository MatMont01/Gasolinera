import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ROUTES from '../routes/CONSTANTS';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
    };

    return (
        <nav className="bg-gray-900 p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-lg font-bold">Administracion de Accesos</div>
                <div className="flex space-x-4">
                    <Link to={ROUTES.HOME} className="text-gray-300 hover:text-white">Home</Link>
                    {user?.access ? (
                        <>
                            <Link to={ROUTES.MANAGE_USERS} className="text-gray-300 hover:text-white">Manage Users</Link>
                            <Link to={ROUTES.MANAGE_STATIONS} className="text-gray-300 hover:text-white">Manage Stations</Link>
                            <Link to={ROUTES.CREATE_USER} className="text-gray-300 hover:text-white">Create User</Link>
                            <Link to={ROUTES.CREATE_STATION} className="text-gray-300 hover:text-white">Create Station</Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-300 hover:text-white bg-red-600 px-3 py-1 rounded-md"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to={ROUTES.LOGIN} className="text-gray-300 hover:text-white bg-blue-600 px-3 py-1 rounded-md">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
