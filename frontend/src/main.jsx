import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { RulesProvider } from './context/RulesContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <RulesProvider>
                <App />
            </RulesProvider>
        </AuthProvider>
    </React.StrictMode>,
)

