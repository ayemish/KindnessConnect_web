import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'; 
import { SponsorProvider } from './context/SponsorContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> 
      <SponsorProvider>
      <App />
      </SponsorProvider>
    </AuthProvider>
  </React.StrictMode>,
)


