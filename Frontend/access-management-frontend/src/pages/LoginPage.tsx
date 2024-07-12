import React from 'react';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4">Login</h1>
                <LoginForm />
            </div>
        </div>
    );
};

export default LoginPage;
