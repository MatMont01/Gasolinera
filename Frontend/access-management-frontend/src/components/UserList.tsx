import React, { useEffect, useState } from 'react';
import userService from '../services/userService';

const UserList: React.FC = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await userService.getUsers();
            setUsers(data);
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h2>User List</h2>
            <ul>
                {users.map((user: any) => (
                    <li key={user.id}>{user.email} - {user.role}</li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
