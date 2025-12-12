// pages/AdminVerification.jsx

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const MOCK_DEALS = [ 
    {"id": "badge-1", "name": "1 Year Standard Badge", "cost_usd": 25.00, "duration_days": 365},
    {"id": "badge-2", "name": "Lifetime Badge", "cost_usd": 150.00, "duration_days": 9999},
];

const AdminVerification = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const adminUid = user?.uid;

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            alert("Access Denied: Admin privileges required.");
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    const fetchRequests = async () => {
        if (!adminUid) return;
        setDataLoading(true);
        try {
            // Fetches all verification requests
            const response = await api.get('/verification/', { params: { admin_uid: adminUid } });
            setRequests(response.data || []);
        } catch (error) {
            console.error("Error fetching verification requests:", error);
            alert("Failed to fetch requests.");
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchRequests();
        }
    }, [user]);

    const handleAction = async (requestId, newStatus) => {
        const actionName = newStatus.toUpperCase();
        if (!window.confirm(`Are you sure you want to ${actionName} request ${requestId}?`)) return;

        try {
            const payload = { status: newStatus };
            
            await api.put(`/verification/${requestId}`, payload, {
                params: { admin_uid: adminUid }
            });
            
            alert(`Request ${actionName} successful! User's badge status has been updated.`);
            fetchRequests(); 
            
        } catch (error) {
            console.error("Verification update failed:", error);
            alert("Update failed. Check console for details.");
        }
    };
    
    if (authLoading || dataLoading || user?.role !== 'admin') {
        return <div className="p-10 text-center text-gray-500">Loading Verification Requests...</div>;
    }

    const pendingRequests = requests.filter(r => r.status === 'pending');

    return (
        <div className="min-h-screen py-10 max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Verification Requests </h1>

            <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                    <p className="text-gray-500">No pending verification requests found.</p>
                ) : (
                    pendingRequests.map((req) => (
                        <div key={req.id} className="p-4 border rounded-xl shadow-md transition bg-white border-brand-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-gray-800">{req.user_name}</h2>
                                <p className="text-sm text-gray-600 mt-1">Requesting: {MOCK_DEALS.find(d => d.id === req.deal_id)?.name || 'Unknown Deal'}</p>
                                <p className="text-xs text-gray-500 mt-2">UID: {req.requester_uid} | Submitted: {new Date(req.created_at).toLocaleDateString()}</p>
                            </div>
                            
                            {/* Proof and Actions */}
                            <div className="flex items-center gap-3 flex-wrap">
                                

                                <button onClick={() => handleAction(req.id, 'approved')} className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold">
                                    Approve Badge
                                </button>
                                <button onClick={() => handleAction(req.id, 'rejected')} className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold">
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminVerification;