// UsersAdmin.jsx 

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/api'; 

const UsersAdmin = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [dataLoading, setDataLoading] = useState(true); 

    const adminUid = user?.uid; 

    // Security Check and Data Fetch
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            alert("Access Denied: Admin privileges required.");
            navigate('/');
        } else if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user, authLoading, navigate]);

    // Function to fetch ALL users from the backend
    const fetchUsers = async () => {
        setDataLoading(true);
        try {
          
            const response = await api.get('/users/', {
                
                params: { admin_uid: adminUid } 
            });
            setUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            
            if (error instanceof TypeError) {
                 alert("Error fetching users: Auth token issue. Please check console.");
            } else {
                 alert("Failed to fetch users. Check console and API.");
            }
        } finally {
            setDataLoading(false);
        }
    };
    
 
    
    // --- Handle User Deletion (Requires DELETE /users/{uid} endpoint) ---
    const handleDelete = async (targetUid, userName) => {
        if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE user ${userName} (${targetUid})? This cannot be undone.`)) return;

        try {
            // API call to delete the user from both Firestore and Firebase Auth
            await api.delete(`/users/${targetUid}`, {
                params: { admin_uid: adminUid } 
            });

            alert(`User ${userName} deleted successfully from the system.`);
            fetchUsers(); 

        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Deletion failed. Ensure the DELETE /users/{uid} endpoint is implemented.");
        }
    };

    if (dataLoading || !user || user.role !== 'admin') {
        return <div className="p-10 text-center text-gray-500">Loading User Management Data...</div>;
    }

    return (
        <div className="min-h-screen py-10 max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">User Management ({users.length})</h1>
            <p className="text-sm text-gray-500 mb-8">
                View user base and status. **Verification is managed on the dedicated Verification Requests page.**
            </p>

            <div className="space-y-4">
                {users.map((u) => (
                    <div key={u.uid} className="p-4 bg-white border rounded-xl flex justify-between items-center shadow-sm">
                        <div className="flex-1 min-w-0">
                            <span className="font-bold text-lg truncate block">
                                {u.full_name} 
                                <span className="text-sm text-gray-500 ml-2">({u.role.toUpperCase()})</span>
                            </span>
                            <p className="text-sm text-gray-500 truncate">{u.email}</p>
                            <p className="text-xs text-gray-400">
                                Joined: {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : 'N/A'}
                            </p>
                        </div>
                        
                        <div className="flex gap-2 items-center flex-shrink-0 flex-wrap justify-end">
                            
                            {/* --- Verification Status Display Only --- */}
                            {u.is_verified ? (
                                <span className="text-blue-600 font-semibold text-sm flex items-center px-3 py-1 bg-blue-50 rounded-full">
                                    Verified
                                </span> 
                            ) : (
                                <span className="text-orange-500 font-semibold text-sm px-3 py-1 bg-orange-50 rounded-full">
                                    Pending/Not Verified
                                </span>
                            )}

                            {/* --- Delete Button --- */}
                            <button 
                                onClick={() => handleDelete(u.uid, u.full_name)}
                                className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold" 
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsersAdmin;