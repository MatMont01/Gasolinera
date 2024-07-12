import authService from '../services/authService';
import {createContext, useContext, useState} from "react";

// Crear el contexto de autenticación
const AuthContext = createContext<any>(null);

export const AuthProvider = ({children}: any) => {
    const [user, setUser] = useState(authService.getCurrentUser());

    const login = async (email: string, password: string) => {
        const data = await authService.login(email, password);
        setUser(data);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
