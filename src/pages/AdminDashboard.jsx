import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [requests, setRequests] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    const adminUid = user?.uid; 


    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            alert("Access Denied: Admin privileges required.");
            navigate('/');
        }
    }, [user, authLoading, navigate]);


    const fetchRequests = async () => {
        setDataLoading(true);
        try {
            //  This endpoint fetches all statuses (pending, verified, rejected)
            const response = await api.get('/requests/');
            setRequests(response.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchRequests();
        }
    }, [user]);

    // Handle Approve / Reject Actions
    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        
        try {
            const endpoint = `/requests/${id}/${action}`; 
            
            // Pass the Admin's authenticated UID for backend validation
            await api.put(endpoint, null, {
                params: { uid: adminUid } 
            });

            alert(`Request ${action === 'verify' ? 'Approved' : 'Rejected'}!`);
            fetchRequests(); // Refresh the list
            
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            alert("Action failed. Check console or verify your user role in Firestore.");
        }
    };

    if (authLoading || !user || user.role !== 'admin') {
        return <div className="text-center py-20 text-gray-500">Accessing Admin Panel...</div>;
    }

    const pendingRequests = requests.filter(r => r.status === 'pending');
    
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                
                <h1 className="text-4xl font-bold text-gray-800 mb-2"> Administrator Control</h1>
                <p className="text-sm text-gray-500 mb-8">Management portal for verification and oversight.</p>

                {/* Navigation Links  */}
                <div className="flex gap-4 mb-8">
                    <Link to="/admin/requests" className="px-4 py-2 bg-white border rounded-lg hover:bg-brand-50 transition">All Requests</Link>
                    <Link to="/admin/donations" className="px-4 py-2 bg-white border rounded-lg hover:bg-brand-50 transition">All Donations</Link>
                    <Link to="/admin/users" className="px-4 py-2 bg-white border rounded-lg hover:bg-brand-50 transition">User Management</Link>
                    <Link to="/admin/sponsors" className="px-4 py-2 bg-white border rounded-lg hover:bg-brand-50 transition">Sponsor Management</Link>
                    <Link to="/admin/verification" className="px-4 py-2 bg-white border rounded-lg hover:bg-brand-50 transition"> Verification Requests</Link>
                </div>
                
                {/* --- PENDING REQUESTS SECTION --- */}
                <div className="bg-white rounded-3xl shadow-lg border border-brand-50 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-orange-500 mb-6">
                        Pending Approvals ({dataLoading ? '...' : pendingRequests.length})
                    </h2>

                    {dataLoading ? (
                        <div className="text-center py-10 text-brand-300">Loading data...</div>
                    ) : pendingRequests.length === 0 ? (
                        <p className="text-gray-500 italic">No new requests requiring action.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="flex flex-col md:flex-row gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50 items-center">
                                    
                                    {/* Campaign Cover Image */}
                                    {req.image_url && (
                                        <div className="w-20 h-16 overflow-hidden rounded-lg flex-shrink-0">
                                            <img 
                                                src={req.image_url} 
                                                alt={req.title} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Details & Deep Link */}
                                    <div className="flex-1 min-w-0">
                                        {/* Clickable Title leads to details page for review */}
                                        <Link 
                                            to={`/requests/${req.id}`} 
                                            className="font-bold text-lg text-gray-800 hover:text-brand-300 transition truncate block"
                                        >
                                            {req.title}
                                        </Link>
                                        <p className="text-sm text-gray-500">Category: {req.category} | Goal: ${req.goal_amount}</p>
                                    </div>

                                    {/* BUTTON COLORS REVERTED TO BRAND */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <button 
                                            onClick={() => handleAction(req.id, 'verify')}
                                            className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleAction(req.id, 'reject')}
                                            className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Placeholder for All Campaigns*/}
                <p className="text-xs text-gray-400 mt-12">Total campaigns in system: {requests.length}</p>

            </div>
        </div>
    );
};

export default AdminDashboard;