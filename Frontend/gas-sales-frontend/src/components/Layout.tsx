import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx';

const Layout: React.FC = () => {
    return (
        <div>
            <div className="min-h-screen bg-gray-900 text-white">
            <Navbar/>
            <main className="container mx-auto p-4">
                <Outlet/>
            </main>
        </div>
        </div>
    );
};

export default Layout;
