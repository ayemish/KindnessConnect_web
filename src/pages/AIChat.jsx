// src/pages/AIChat.jsx

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute'; // Ensure only logged-in users see the full page

const AIChat = () => {
    // The iframe dimensions are handled by the inline style
    const iframeStyle = {
        height: '85vh', // Use viewport height to make it fill the screen below the navbar
        width: '100%',
        minHeight: '700px'
    };

    // We only use the iframe content for the full-page chat agent
    return (
        // The ProtectedRoute ensures this page is secure and the user is authenticated.
        // We wrap the content in a container for good spacing below the main Navbar.
        <div className="py-10 px-4 max-w-7xl mx-auto"> 
            <h1 className="text-3xl font-bold text-gray-800 mb-6"> Virtual Assistant Chat</h1>
            <p className="text-gray-500 mb-4">
                Ask the RubikChat Assistant about creating requests, making donations, or the verification process.
            </p>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                <iframe
                    src="https://app.rubikchat.com/chat/mFHI79UrQARXQXRGgZg2Tuen"
                    width="100%"
                    style={iframeStyle}
                    frameBorder="0"
                    title="RubikChat AI Assistant"
                ></iframe>
            </div>
        </div>
    );
};

export default AIChat;