// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextProps {
    user: any;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);

    const login = async (email: string, password: string) => {
        const response = await axios.post('http://localhost:8000/api/token/', {
            email,
            password,
        });
        setUser(response.data);
        localStorage.setItem('token', response.data.access);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
