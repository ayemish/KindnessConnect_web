import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const AllRequests = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [requests, setRequests] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);


    useEffect(() => {
        // 1. Enforce Admin Role: If not admin AND loading is done, redirect.
        if (!authLoading && (!user || user.role !== 'admin')) {
            alert("Access Denied.");
            navigate('/');
        } else if (user?.role === 'admin') {
            // 2. Fetch data only if user is confirmed admin
            fetchRequests();
        }
    }, [user, authLoading, navigate]);

    const fetchRequests = async () => {
        try {
            // Fetches ALL requests, including pending and rejected
            const response = await api.get('/requests/');
            setRequests(response.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setDataLoading(false);
        }
    };
    
    // Initial Render Checks
    if (dataLoading || authLoading || !user || user.role !== 'admin') {
        return <div className="p-10 text-center text-gray-500">Loading Admin Data...</div>;
    }

    const totalGoal = requests.reduce((sum, req) => sum + (req.goal_amount || 0), 0);

    return (
        <div className="min-h-screen py-10 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">All Campaigns Overview ({requests.length})</h1>
            <p className="text-sm text-gray-500 mb-8">Total Campaigns: {requests.length} </p>

            <div className="space-y-3">
                {requests.map((req) => (
                    <div key={req.id} className="p-3 bg-white border rounded-xl flex items-center shadow-sm">
                        
                        {/* Campaign Cover Image */}
                        {req.image_url && (
                            <div className="w-20 h-16 overflow-hidden rounded-lg mr-4 flex-shrink-0">
                                <img 
                                    src={req.image_url} 
                                    alt={req.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0"> 
                            <Link to={`/requests/${req.id}`} className="font-bold text-lg hover:text-brand-300 truncate block">{req.title}</Link>
                            <p className="text-xs text-gray-500 truncate">Requester ID: {req.requester_uid.substring(0, 8)}...</p>
                        </div>
                        
                        <div className="text-right ml-4 flex-shrink-0">
                            <span className="font-semibold text-gray-800 block">${req.collected_amount} / ${req.goal_amount}</span>
                            <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                                req.status === 'verified' ? 'bg-green-100 text-green-700' : 
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {req.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllRequests;