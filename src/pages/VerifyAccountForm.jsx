// pages/VerifyAccountForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const VerifyAccountForm = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    
    const [deals, setDeals] = useState([]);
    const [formLoading, setFormLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedDealDetails, setSelectedDealDetails] = useState(null); 
    
    const [formData, setFormData] = useState({
        requester_uid: '',
        deal_id: '',

    });
    
    // Security Check and UID setting
    useEffect(() => {
        if (!authLoading && !user) {
            alert("Please log in to request verification.");
            navigate('/login');
        }
        if (user && user.uid) {
            setFormData(prev => ({ ...prev, requester_uid: user.uid }));
        }
    }, [user, authLoading, navigate]);

    // Fetch Deals
    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await api.get('/verification/deals');
                setDeals(response.data);
                
                if (response.data.length > 0) {
                    const defaultDeal = response.data[0];
                    setFormData(prev => ({ ...prev, deal_id: defaultDeal.id }));
                    setSelectedDealDetails(defaultDeal); 
                }
            } catch (error) {
                console.error("Error fetching deals:", error);
            } finally {
                setFormLoading(false);
            }
        };
        fetchDeals();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'deal_id') {
            const deal = deals.find(d => d.id === value);
            setSelectedDealDetails(deal);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, proof_document: e.target.files[0] });
    };

    const handleSubmission = async (e) => {
        e.preventDefault();
        
        
        
        if (!formData.deal_id) {
            return alert("Please select a verification deal.");
        }
        
        setFormLoading(true);

        try {
            const data = new FormData();
            data.append('requester_uid', user.uid);
            data.append('deal_id', formData.deal_id);



            // Execute the form submission (backend saves the request)
            await api.post('/verification/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // On SUCCESS: Show the payment simulation view
            setIsSubmitted(true);
            
        } catch (error) {
            console.error("Verification submission failed:", error);
            alert("Failed to submit request. Check console.");
        } finally {
            setFormLoading(false);
        }
    };
    
    //  Handles the final "payment" step
    const handlePayment = () => {
        alert("Payment simulated successfully! Your request is now pending review.");
        navigate('/profile'); 
    };

    if (authLoading || formLoading || !user) {
        return <div className="p-10 text-center text-gray-500">Loading verification deals...</div>;
    }
    
    // --- STEP 2: PAYMENT SIMULATION VIEW ---
    if (isSubmitted && selectedDealDetails) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-brand-50 text-center">
                    <h1 className="text-3xl font-bold text-green-600 mb-4">Submission Complete!</h1>
                    <p className="text-gray-600 mb-8">Your documents have been securely uploaded. Please complete the purchase to finalize your request.</p>
                    
                    <div className="p-6 mb-8 border border-gray-200 rounded-xl bg-brand-50">
                        <p className="text-2xl font-extrabold text-gray-800">{selectedDealDetails.name}</p>
                        <p className="text-xl font-bold text-green-600 mt-2">Total Due: ${selectedDealDetails.cost_usd.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 mt-1">Badge duration: {selectedDealDetails.duration_days} days.</p>
                    </div>

                    <button 
                        onClick={handlePayment} // This button performs the final action/navigation
                        className="w-full bg-brand-300 text-white font-bold py-4 rounded-xl hover:bg-brand-200 transition shadow-lg shadow-brand-200/50"
                    >
                        Proceed to Payment (Simulated)
                    </button>
                    
                    <button 
                        onClick={() => setIsSubmitted(false)} // Go back to step 1 (if needed)
                        className="w-full mt-3 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-300 transition"
                    >
                        Go Back to Submission Details
                    </button>
                </div>
            </div>
        );
    }

    // --- STEP 1: FORM SUBMISSION VIEW ---
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-brand-50">
                <h1 className="text-3xl font-bold text-gray-800 mb-2"> Request Official Badge</h1>
                <p className="text-gray-500 mb-8">Elevate your profile's trustworthiness by acquiring an official verification badge.</p>
                
                <form onSubmit={handleSubmission} className="space-y-6">
                    
                    <h3 className="text-xl font-bold text-brand-300">1. Select Verification Deal</h3>
                    <div className="space-y-3 p-4 border rounded-xl bg-brand-50/50">
                        {deals.map(deal => (
                            <label key={deal.id} className="flex flex-col sm:flex-row sm:items-center space-x-0 sm:space-x-3 p-3 border border-brand-50 rounded-lg hover:bg-white transition cursor-pointer">
                                
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <input
                                        type="radio"
                                        name="deal_id"
                                        value={deal.id}
                                        checked={formData.deal_id === deal.id}
                                        onChange={handleChange}
                                        required
                                        className="form-radio h-5 w-5 text-brand-300 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-gray-800 font-semibold">{deal.name}</span>
                                        <span className="block text-xs text-gray-500">Duration: {deal.duration_days} days</span>
                                    </div>
                                </div>
                                
                                <span className="font-bold text-lg text-green-600 sm:ml-auto mt-2 sm:mt-0">${deal.cost_usd.toFixed(2)}</span>
                            </label>
                        ))}
                    </div>

                    <h3 className="text-xl font-bold text-brand-300 pt-4 mt-6 border-t border-brand-50">2. Submit Proof</h3>
                    <p className="text-sm text-gray-600">Please upload a valid government-issued ID (driving license, national ID) and describe the document below. This document is kept strictly confidential.</p>

       

                    <button 
                        type="submit" // Submits the form data to the backend
                        disabled={formLoading}
                        className="w-full bg-brand-300 text-white font-bold py-4 rounded-xl hover:bg-brand-200 transition shadow-lg shadow-brand-200/50 disabled:bg-gray-300"
                    >
                        {formLoading ? "Submitting Request..." : "Submit Verification Request"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyAccountForm;