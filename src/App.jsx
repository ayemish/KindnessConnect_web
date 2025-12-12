import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import Home from './pages/Home';
import RequestDetails from './pages/RequestDetails';
import CreateRequest from './pages/CreateRequest';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ChatPage from './pages/ChatPage'; 
import ChatInbox from './pages/ChatInbox';
import VerifyAccountForm from './pages/VerifyAccountForm';
import ProtectedRoute from './components/ProtectedRoute'; 

//AI chat bot
import AIChat from './pages/AIChat';
import RubikChatEmbed from './components/RubikChatEmbed';

// ADMIN PAGES
import AdminDashboard from './pages/AdminDashboard';
import UsersAdmin from './pages/UsersAdmin';
import AllRequests from './pages/AllRequests';
import AllDonations from './pages/AllDonations';
import AdminVerification from './pages/AdminVerification';

// SPONSOR IMPORTS
import { useSponsor } from './context/SponsorContext';
import AdminSponsors from './pages/AdminSponsors'; 
import SponsorForm from './pages/SponsorForm';



function App() {
    const { theme } = useSponsor(); 
    // Set CSS variables for dynamic theming
    const themeStyle = {
        '--color-bg-light': theme.light_bg_hex,
        '--color-brand-primary': theme.primary_color_hex,
        // Calculate slightly lighter/darker shades if needed, or use fixed defaults
        '--color-brand-200': theme.primary_color_hex ? theme.primary_color_hex + 'B3' : '#FDACAC', 
    };

    return (
        <Router>
            <div 
                
                className="min-h-screen bg-gray-50 font-sans text-gray-900" 
                style={themeStyle}
            >
                
                <Navbar /> 
                
                <Routes>
                    {/* --- PUBLIC ROUTES --- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/requests/:id" element={<RequestDetails />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/sponsor" element={<SponsorForm />} /> 
                    <Route path="/verify" element={<VerifyAccountForm />} />

                    {/* AUTH ROUTES - Always public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* --- PROTECTED USER ROUTES --- */}
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> 
                    <Route path="/chats" element={<ProtectedRoute><ChatInbox /></ProtectedRoute>} />
                    <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} /> 
                    <Route path="/create" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
                    
                    {/* --- PROTECTED ADMIN ROUTES (Require 'admin' role) --- */}
                    <Route 
                        path="/admin" 
                        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/admin/dashboard" 
                        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/admin/users" 
                        element={<ProtectedRoute allowedRoles={['admin']}><UsersAdmin /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/admin/requests" 
                        element={<ProtectedRoute allowedRoles={['admin']}><AllRequests /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/admin/donations" 
                        element={<ProtectedRoute allowedRoles={['admin']}><AllDonations /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/admin/sponsors" 
                        element={<ProtectedRoute allowedRoles={['admin']}><AdminSponsors /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/admin/verification" 
                        element={<ProtectedRoute allowedRoles={['admin']}><AdminVerification /></ProtectedRoute>} 
                    />
                    
                    {/* --- PROTECTED AI CHAT ROUTE --- */}
                    <Route 
                        path="/ai-chat" 
                        element={<ProtectedRoute><AIChat /></ProtectedRoute>} 
                    />
                    
                </Routes>
                
                <Footer /> 
                <RubikChatEmbed />

            </div>
        </Router>
    );
}

export default App;