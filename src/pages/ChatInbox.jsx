// pages/ChatInbox.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../api/firebase';
import api from '../api/api';
import { collection, query, where, or, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const ChatInbox = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [inboxLoading, setInboxLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading || !user) {
            if (!authLoading && !user) navigate('/login');
            return;
        }

        const fetchChatRooms = () => {
            const chatsCollection = collection(db, "chats");
            
            // Query where the current user is either the requester OR the donor
            const q = query(
                chatsCollection, 
                or(
                    where("requester_uid", "==", user.uid),
                    where("donor_uid", "==", user.uid)
                )
            );

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const chatPromises = snapshot.docs.map(async (chatDoc) => {
                    const chatData = chatDoc.data();
                    
                    // Fetch the Request title for context
                    const requestId = chatData.request_id;
                    let requestTitle = "Campaign (Loading...)";
                    
                    try {
                        // Use the conventional API endpoint to fetch request details
                        const response = await api.get(`/requests/${requestId}`);
                        requestTitle = response.data.title;
                    } catch (e) {
                        requestTitle = `Campaign ID: ${requestId} (Error fetching title)`;
                    }

                    // Determine the name of the person the user is chatting with
                    const otherUid = chatData.requester_uid === user.uid ? chatData.donor_uid : chatData.requester_uid;
                    
                    // Fetch other user's name
                    let otherUserName = "Loading User...";
                    
                    const otherUserDoc = await getDoc(doc(db, "users", otherUid));
                    if (otherUserDoc.exists()) {
                        // Using full_name if available, falling back to truncated UID
                        otherUserName = otherUserDoc.data().full_name || `${otherUid.substring(0, 8)}...`;
                    } else {
                        otherUserName = `${otherUid.substring(0, 8)}...`;
                    }
                    
                    // Determine role in the conversation for display
                    const conversationRole = chatData.requester_uid === user.uid ? "Requester" : "Donor";


                    return {
                        id: chatDoc.id,
                        ...chatData,
                        requestTitle,
                        otherUserName,
                        conversationRole
                    };
                });
                
                const resolvedChats = await Promise.all(chatPromises);
                setChats(resolvedChats);
                setInboxLoading(false);
            }, (err) => {
                console.error("Firestore listen error:", err);
                setError("Failed to load chat data.");
                setInboxLoading(false);
            });

            return () => unsubscribe();
        };

        fetchChatRooms();

    }, [user, authLoading, navigate]);


    if (authLoading || inboxLoading) {
        // Use brand color for loading state
        return <div className="p-10 text-center text-brand-300">Loading Chat Inbox...</div>;
    }
    
    if (!user) {
        return <div className="p-10 text-center text-red-500">Please log in to view your chats.</div>;
    }
    
    return (
        <div className="min-h-screen py-10 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-2">Your Conversations</h1>

                {error && <div className="bg-red-100 p-3 rounded text-red-700 mb-4">{error}</div>}

                {chats.length === 0 ? (
                    <div className="bg-white p-10 rounded-2xl text-center shadow-lg border border-brand-50">
                        <p className="text-gray-500 text-lg">You have no active conversations yet. </p>
                        <Link 
                            to="/" 
                            // Use brand colors for links
                            className="mt-4 inline-block px-6 py-2 bg-brand-300 text-white rounded-full font-semibold hover:bg-brand-200 transition"
                        >
                            Explore Campaigns
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => navigate(`/chat/${chat.id}`)}
                                // Enhanced card styling with dynamic theme border/background
                                className="bg-white p-5 rounded-2xl shadow-lg border border-brand-50 hover:shadow-xl hover:border-brand-300 transition cursor-pointer flex justify-between items-center"
                            >
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-gray-800 truncate">
                                        {chat.otherUserName} 
                                        <span className="text-xs font-medium text-gray-400 ml-2"></span>
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1 truncate">
                                        <span className="font-semibold text-brand-300 mr-1">Regarding:</span> {chat.requestTitle}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Conversation ID: {chat.id.substring(0, 10)}...
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="text-brand-300 font-bold text-lg transition hover:text-brand-200">
                                        Open Chat →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInbox;