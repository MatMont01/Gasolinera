import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ThreeDots } from 'react-loader-spinner';

const ManageUsersPage: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleEdit = (userId: string) => {
        navigate(`/edit-user/${userId}`);
    };

    const handleDelete = async (userId: string) => {
        setLoading(true);
        await userService.deleteUser(userId);
        loadUsers();
    };

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-3xl font-bold mb-6">Manage Users</h2>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <ThreeDots height="80" width="80" color="red" ariaLabel="loading" />
                </div>
            ) : (
                <ul className="space-y-4">
                    {users.map((user: any) => (
                        <li key={user.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-md shadow-md">
                            <div>
                                <p className="text-lg font-medium">{user.email}</p>
                                <p className="text-sm text-gray-400">{user.role}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={() => handleEdit(user.id)} text="Edit" />
                                <Button onClick={() => handleDelete(user.id)} text="Delete" color="red" />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageUsersPage;
