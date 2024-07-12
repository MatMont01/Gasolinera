import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { useNavigate, useParams } from 'react-router-dom';

const UserForm: React.FC<{ stations: any[], onSave: () => void }> = ({ stations, onSave }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('seller');
    const [assignedStation, setAssignedStation] = useState('');
    const [username, setUsername] = useState(''); // Nuevo campo para username
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            if (id) {
                const user = await userService.getUserById(id);
                setEmail(user.email);
                setRole(user.role);
                setAssignedStation(user.assigned_station ? user.assigned_station.toString() : '');
                setUsername(user.username); // Setea el username
            }
        };
        loadUser();
    }, [id]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = { email, password, role, assigned_station: assignedStation, username }; // Incluye username
        try {
            if (id) {
                await userService.updateUser(id, data);
            } else {
                await userService.createUser(data);
            }
            onSave();
            navigate('/users');
        } catch (error) {
            console.error('Failed to submit form:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-gray-300">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                />
            </div>
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
                    required={!id}
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-300">Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                >
                    <option value="seller">Seller</option>
                    <option value="station_admin">Station Admin</option>
                    <option value="refinery_admin">Refinery Admin</option>
                    <option value="driver">Driver</option>
                    <option value="access_admin">Access Admin</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-300">Assigned Station</label>
                <select
                    value={assignedStation}
                    onChange={(e) => setAssignedStation(e.target.value)}
                    className="w-full p-2 mt-2 bg-gray-700 text-white rounded-md"
                >
                    <option value="">None</option>
                    {stations.map((station) => (
                        <option key={station.id} value={station.id.toString()}>
                            {station.name}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {id ? 'Update' : 'Create'}
            </button>
        </form>
    );
};

export default UserForm;
