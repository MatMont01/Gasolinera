// LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ROUTES from '../routes/CONSTANTS';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate(ROUTES.DASHBOARD);
        } catch (err) {
            setError('Failed to login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold">Login</h2>
                <div className="space-y-1">
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-gray-300"
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full mt-1 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-gray-300"
                    />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900">
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
