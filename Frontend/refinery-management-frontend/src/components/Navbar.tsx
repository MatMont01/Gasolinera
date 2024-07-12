import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.LOGIN);
    };

    return (
        <nav className="bg-gray-800 text-gray-100 shadow-md">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <div>
                    <NavLink to={ROUTES.HOME} className="text-lg font-bold text-indigo-400 hover:text-indigo-500">
                        Home
                    </NavLink>
                </div>
                <div>
                    <ul className="flex space-x-4">
                        <li>
                            <NavLink to={ROUTES.STATIONS} className="hover:text-indigo-400">
                                Stations
                            </NavLink>
                        </li>
                        {user && (
                            <>
                                <li>
                                    <NavLink to={ROUTES.DASHBOARD} className="hover:text-indigo-400">
                                        Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.MANAGE_TRUCKS} className="hover:text-indigo-400">
                                        Manage Trucks
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.MANAGE_ROUTES} className="hover:text-indigo-400">
                                        Manage Routes
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.MANAGE_CHECKPOINTS} className="hover:text-indigo-400">
                                        Manage Checkpoints
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.MANAGE_SOLICITUDES} className="hover:text-indigo-400">
                                        Manage Solicitudes
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to={ROUTES.MAP} className="hover:text-indigo-400">
                                        Map
                                    </NavLink>
                                </li>
                                <li>
                                    <button onClick={handleLogout} className="hover:text-red-400">
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                        {!user && (
                            <li>
                                <NavLink to={ROUTES.LOGIN} className="hover:text-indigo-400">
                                    Login
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
