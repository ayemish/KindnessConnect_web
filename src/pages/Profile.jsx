import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Profile = () => {
    const { user, loading: authLoading, logout } = useAuth(); 
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('requests');
    const [userRequests, setUserRequests] = useState([]);
    const [userDonations, setUserDonations] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    const uid = user?.uid; 

    
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Data Fetching Logic (Runs only when UID is available)
    useEffect(() => {
        if (uid) {
            const fetchData = async () => {
                setDataLoading(true);
                try {
                    
                    // Fetch requests by user
                    const reqPromise = api.get(`/requests/user/${uid}`);
                    // Fetch donations by user
                    const donPromise = api.get(`/donations/user/${uid}`);

                    const [reqResponse, donResponse] = await Promise.all([reqPromise, donPromise]);

                    setUserRequests((reqResponse.data || []).filter(item => item && item.id));
                    setUserDonations((donResponse.data || []).filter(item => item && item.id));

                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setDataLoading(false);
                }
            };
            fetchData();
        }
    }, [uid]);


    if (authLoading || !user) {
        return <div className="text-center py-20 text-gray-500">Loading user session...</div>;
    }

    // Safely format the join date
    const joinDate = user.created_at 
        ? format(new Date(user.created_at), 'MMM d, yyyy') 
        : 'N/A';

    // Helper function for request status color
    const getRequestStatusStyles = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-orange-100 text-orange-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-500';
        }
    };

    // Function to render the content based on the active tab
    const renderContent = () => {
        if (dataLoading) {
            return <div className="text-center py-10 text-brand-300">Loading data...</div>;
        }

        // --- MY REQUESTS TAB 
        if (activeTab === 'requests') {
            return (
                <div className="space-y-4">
                    <Link to="/create" className="text-brand-300 hover:text-brand-200 font-medium flex items-center gap-1 mb-4">
                        + Create a New Funding Request
                    </Link>
                    {userRequests.length === 0 ? (
                        <p className="text-gray-500">You have no requests yet. <Link to="/create" className="text-brand-300 underline">Start one now</Link>.</p>
                    ) : (
                        userRequests.map(req => (
                            <div key={req.id} className="p-4 border border-gray-100 rounded-xl bg-white flex items-center shadow-sm hover:shadow-md transition">
                                
                                
                                <div className="flex-shrink-0 w-24 h-20 overflow-hidden rounded-lg mr-4">
                                    {req.image_url ? (
                                        <img 
                                            src={req.image_url} 
                                            alt={req.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                
                                {/* Content Column */}
                                <div className="flex-1 flex justify-between items-center">
                                    <div className="flex-1 pr-4">
                                        <Link to={`/requests/${req.id}`} className="font-bold text-lg hover:text-brand-300 line-clamp-1">{req.title}</Link>
                                        <p className="text-sm text-gray-500">Goal: ${req.goal_amount} | Raised: ${req.collected_amount}</p>
                                    </div>
                                    <span className={`flex-shrink-0 px-3 py-1.5 text-sm rounded ${
                                        getRequestStatusStyles(req.status)
                                    }`}>
                                        {req.status ? req.status.toUpperCase() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            );
        }

        // --- MY DONATIONS TAB  ---
        if (activeTab === 'donations') {
            return (
                <div className="space-y-4">
                    {userDonations.length === 0 ? (
                        <p className="text-gray-500">You haven't made any donations yet.</p>
                    ) : (
                        userDonations.map(don => {
                            const campaignTitle = don.request_title || 'Unknown Campaign';
                            const donationDate = new Date(don.timestamp);
                            const displayDate = format(donationDate, 'MMM d, yyyy');
                            const displayTime = format(donationDate, 'h:mm a');
                            
                            

                            return (
                                // Reverted to the original, non-image card structure for donations
                                <div key={don.id} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        
                                        {/* Donation Header and Link */}
                                        <div className="flex-1">
                                            <Link 
                                                to={`/requests/${don.request_id}`} 
                                                className="font-bold text-lg text-gray-800 hover:text-brand-300 transition"
                                            >
                                                Donation towards: {campaignTitle} 
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Donated on {displayDate} at {displayTime}
                                            </p>
                                        </div>
                                        
                                        {/* Amount */}
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xl font-extrabold text-brand-300">${don.amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            );
        }
        return null; 
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2"> Welcome, {user.full_name}</h1>
                <p className="text-gray-500 text-lg mb-8">
                    Your personal dashboard for managing campaigns and profile status.
                </p>

                {/* --- PROFILE SUMMARY AND VERIFICATION --- */}
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-brand-50 mb-10">
                    <h2 className="text-2xl font-bold text-brand-300 mb-4">Account Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* 1. Basic Info */}
                        <div>
                            <p className="text-sm text-gray-500">Email:</p>
                            <p className="font-medium truncate">{user.email}</p>
                            <p className="text-sm text-gray-500 mt-2">Joined:</p>
                            <p className="font-medium">{joinDate}</p>
                        </div>

                        {/* 2. Role and Contact */}
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500">Role:</p>
                            <p className="font-medium capitalize">{user.role}</p>
                            <p className="text-sm text-gray-500 mt-2">Phone:</p>
                            <p className="font-medium">{user.phone_number || 'N/A'}</p>
                        </div>

                        {/* 3. Verification Status */}
                        <div className="p-3 bg-brand-50/70 rounded-xl">
                            <h3 className="font-bold mb-2">Verification Badge</h3>
                            {user.is_verified ? (
                                <p className="text-green-600 font-semibold flex items-center">
                                    ✅ Officially Verified
                                </p>
                            ) : (
                                <>
                                    <p className="text-orange-600 font-semibold">
                                        Unverified
                                    </p>
                                    <Link to="/verify" className="mt-2 inline-block bg-brand-300 text-white px-3 py-1 text-sm rounded-lg hover:bg-brand-200 transition">
                                        Start Verification
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <button onClick={logout} className="mt-8 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                        Log Out
                    </button>
                </div>


                {/* --- TAB NAVIGATION --- */}
                <div className="flex border-b border-gray-200 mb-6 space-x-4">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 font-semibold transition ${
                            activeTab === 'requests' ? 'border-b-4 border-brand-300 text-brand-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        My Requests ({userRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('donations')}
                        className={`px-4 py-2 font-semibold transition ${
                            activeTab === 'donations' ? 'border-b-4 border-brand-300 text-brand-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        My Donations ({userDonations.length})
                    </button>
                </div>

                {/* --- CONTENT AREA --- */}
                {renderContent()}

                <p className="mt-12 text-xs text-gray-400">UID: {user.uid}</p>
            </div>
        </div>
    );
};

export default Profile;