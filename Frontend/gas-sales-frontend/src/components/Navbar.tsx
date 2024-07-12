import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routes/CONSTANTS';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 p-4 shadow-lg">
            <ul className="flex justify-between items-center">
                <li>
                    <Link to={ROUTES.HOME} className="text-white hover:text-gray-400">
                        Home
                    </Link>
                </li>
                {user ? (
                    <div className="flex space-x-4">
                        <li>
                            <Link to={ROUTES.DASHBOARD} className="text-white hover:text-gray-400">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to={ROUTES.MANAGE_SALES} className="text-white hover:text-gray-400">
                                Manage Sales
                            </Link>
                        </li>
                        <li>
                            <Link to={ROUTES.MANAGE_PUMPS} className="text-white hover:text-gray-400">
                                Manage Pumps
                            </Link>
                        </li>
                        <li>
                            <Link to={ROUTES.MANAGE_FUEL_TYPES} className="text-white hover:text-gray-400">
                                Manage Fuel Types
                            </Link>
                        </li>
                        <li>
                            <Link to={ROUTES.MANAGE_FUEL_STOCKS} className="text-white hover:text-gray-400">
                                Manage Fuel Stocks
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={logout}
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </li>
                    </div>
                ) : (
                    <li>
                        <Link to={ROUTES.LOGIN} className="text-white hover:text-gray-400">
                            Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
