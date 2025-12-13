// pages/AllDonations.jsx (Updated)

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { format } from 'date-fns';

const AllDonations = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [donations, setDonations] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);


    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            navigate('/');
        } else if (user) {
            fetchDonations();
        }
    }, [user, authLoading, navigate]);


    const fetchDonations = async () => {
        try {
            //  Call the /donations/all endpoint, passing Admin UID for authorization
            const response = await api.get('/donations/all', {
                params: { admin_uid: user.uid } // Admin UID passed for backend check
            }); 

            setDonations(response.data || []);

        } catch (error) {
            console.error("Error fetching donations:", error);
            alert("Failed to fetch all donations. Check API endpoint and permissions.");
        } finally {
            setDataLoading(false);
        }
    };

    if (dataLoading || !user || user.role !== 'admin') {
        return <div className="p-10 text-center text-gray-500">Loading Admin Data...</div>;
    }

// Calculate Total Funds Raised
    const totalRaised = donations.reduce((sum, don) => sum + (don.amount || 0), 0).toFixed(2);


    return (
        <div className="min-h-screen py-10 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Donations Ledger</h1>
           

            <div className="space-y-3">
                {donations.map((don) => (
                    <div key={don.id} className="p-3 bg-white border rounded-xl flex justify-between items-center shadow-sm">
                        <div className="flex-1">
                            <Link to={`/requests/${don.request_id}`} className="font-bold text-gray-800 hover:text-brand-300">
                               {don.request_title || 'Unknown Campaign'}
                            </Link>
                            {/* ADDED DONOR NAME HERE */}
                            <p className="text-sm text-gray-700 font-semibold">
                                Donor: {don.donor_name || don.donor_uid.substring(0, 8) + '...'}
                            </p>
                             <p className="text-xs text-gray-500">
                                Timestamp: {format(new Date(don.timestamp), 'MMM d, yyyy, h:mm a')}
                            </p>
                         </div>
                         <div className="text-right">
                            <span className="font-bold text-lg text-brand-300">${don.amount}</span>
                        </div>
                    </div>
                ))}
             </div>
     </div>
    );
};

export default AllDonations;