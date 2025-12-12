// src/components/RubikChatEmbed.jsx

import { useEffect } from 'react';

const RubikChatEmbed = () => {
    useEffect(() => {
        // Configuration object for the embedded chatbot
        window.embeddedChatbotConfig = {
            chatbotId: "mFHI79UrQARXQXRGgZg2Tuen",
            domain: "app.rubikchat.com"
        };

        // Create the script element
        const script = document.createElement('script');
        script.src = "https://api-proxy-v1.rubikchat.com/embed.js";
        script.setAttribute('chatbotId', 'mFHI79UrQARXQXRGgZg2Tuen');
        script.setAttribute('domain', 'app.rubikchat.com');
        script.defer = true;
        
        // Append the script to the document body to load the chat bubble
        document.body.appendChild(script);

        // Cleanup function to remove the script when the component unmounts 
        return () => {
            document.body.removeChild(script);
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return null; // This component renders nothing itself, it just loads the external script
};

export default RubikChatEmbed;