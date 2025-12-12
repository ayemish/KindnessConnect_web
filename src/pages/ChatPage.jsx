// pages/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../api/firebase'; 
import { 
    collection, doc, query, orderBy, onSnapshot, 
    addDoc, serverTimestamp 
} from 'firebase/firestore';

const ChatPage = () => {
    const { chatId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // 1. Set up Real-time Listener for Messages
    useEffect(() => {
        if (!chatId) return;

        const messagesCollectionRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesCollectionRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setChatLoading(false);
        }, (error) => {
            console.error("Error listening to messages:", error);
            setChatLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    // 2. Scroll to bottom whenever new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 3. Handle Sending Message
    const handleSend = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !chatId) return;

        try {
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text: newMessage,
                sender_uid: user.uid,
                sender_name: user.full_name || user.email,
                timestamp: serverTimestamp() 
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        }
    };

    if (!user) return <div className="p-10 text-center text-red-500">You must be logged in to chat.</div>;
    if (chatLoading) return <div className="p-10 text-center text-brand-300">Loading chat...</div>;

    return (
        <div className="min-h-[80vh] py-8 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg flex flex-col h-[70vh]">
                <h2 className="text-2xl font-bold p-4 border-b text-brand-300">
                    Chat Session
                </h2>

                {/* Message Display Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-500 italic">Start the conversation!</p>
                    ) : (
                        messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender_uid === user.uid ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${
                                    msg.sender_uid === user.uid 
                                        ? 'bg-brand-300 text-white rounded-br-none' 
                                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                    <p className="text-xs font-semibold mb-1 opacity-80">
                                        {msg.sender_uid === user.uid ? 'You' : msg.sender_name || 'Requester'}
                                    </p>
                                    <p>{msg.text}</p>
                                    <span className="text-xs mt-1 block text-right opacity-60">
                                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-brand-300"
                        disabled={!user}
                    />
                    <button
                        type="submit"
                        className="bg-brand-300 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-200 transition disabled:bg-gray-400"
                        disabled={!user || newMessage.trim() === ''}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;