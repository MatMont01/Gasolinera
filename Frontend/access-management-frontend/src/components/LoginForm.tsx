import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-300">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
