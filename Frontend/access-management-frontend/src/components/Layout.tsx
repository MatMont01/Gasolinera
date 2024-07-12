import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="container mx-auto p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
