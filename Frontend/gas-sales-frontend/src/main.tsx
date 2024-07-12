import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import RouterConfig from "./routes/RouterConfig.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterConfig />
        </AuthProvider>
    </React.StrictMode>,
)
