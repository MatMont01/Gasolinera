import React from 'react';
import ReactDOM from 'react-dom/client';
import RouterConfig from './routes/RouterConfig';
import './index.css';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterConfig />
        </AuthProvider>
    </React.StrictMode>,
);
