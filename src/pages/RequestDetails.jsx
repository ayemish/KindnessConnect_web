import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import ImageModal from '../components/ImageModal'; 
import { useNavigate } from 'react-router-dom';

const RequestDetails = () => {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [donating, setDonating] = useState(false);
    const [modalImage, setModalImage] = useState(null); 
    const navigate = useNavigate();


    const handleInitiateChat = async () => {
        if (!user) {
            return alert("Please log in to start a chat.");
        }
        
        // Prevent chatting with yourself
        if (request && user.uid === request.requester_uid) {
            return alert("You cannot start a chat on your own request.");
        }

        try {
            // Call the new backend endpoint
            const response = await api.post(`/requests/${id}/chat/${user.uid}`);
            const chatId = response.data.chat_id;

            // Redirect user to the new chat page
            navigate(`/chat/${chatId}`);
            
        } catch (error) {
            console.error("Failed to initiate chat:", error);
            alert("Could not start chat session.");
        }
    };

    
    // Fetch Data
    const fetchRequest = async () => {
        try {
            const response = await api.get(`/requests/${id}`);
            setRequest(response.data);
        } catch (error) {
            console.error("Error fetching request details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id]);

    // Handle Donation Submission
    const handleDonate = async () => {
        if (!user) {
            return alert("Please log in to make a donation.");
        }
        if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount");

        setDonating(true);

        try {
            // Send Donation to Backend
            await api.post('/donations/', {
                request_id: id,
                donor_uid: user.uid,
                amount: parseFloat(amount),
                payment_method: "card"
            });

            alert(`Thank you! You donated $${amount}`);
            setAmount(''); 
            
            fetchRequest(); // Refresh Data 

        } catch (error) {
            console.error("Donation failed:", error);
            alert("Donation failed. Please try again.");
        } finally {
            setDonating(false);
        }
    };

    // Unified Loading State Check
    if (loading || authLoading) return <div className="text-center py-20 font-bold text-gray-500">Loading details...</div>;
    if (!request) return <div className="text-center py-20 text-red-500">Request not found.</div>;

    // Calculate Progress %
    const percentage = Math.min((request.collected_amount / request.goal_amount) * 100, 100);

    // Check if the current user is the requester (to hide chat button)
    const isRequester = user && user.uid === request.requester_uid;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* MODAL COMPONENT RENDER */}
                <ImageModal 
                    imageUrl={modalImage} 
                    onClose={() => setModalImage(null)} 
                />

                <Link to="/" className="text-gray-500 hover:text-brand-300 mb-6 inline-block font-medium">
                    ← Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-brand-50 overflow-hidden">
                    
                    {/* Header Image (Clickable) */}
                    <div className="h-80 w-full relative cursor-pointer" onClick={() => setModalImage(request.image_url)}>
                        <img 
                            src={request.image_url} 
                            alt={request.title} 
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay and Title remains unchanged */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h1 className="absolute bottom-6 left-6 text-4xl font-bold text-white shadow-sm">
                            {request.title}
                        </h1>
                        <span className="absolute top-6 right-6 bg-brand-300 text-white px-4 py-1 rounded-full font-bold shadow-lg uppercase text-sm">
                            {request.category}
                        </span>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                        
                        {/* Left: Story and Gallery Section */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800">About this Cause</h2>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {request.story}
                            </p>

                            {/* GALLERY DISPLAY SECTION (Clickable Images) */}
                            {request.gallery_urls && request.gallery_urls.length > 0 && (
                                <div className="pt-6 border-t border-brand-50/50 mt-6">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4">Supporting Documents / Gallery</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {request.gallery_urls.map((url, index) => (
                                            <img 
                                                key={index}
                                                src={url} 
                                                alt={`Gallery Image ${index + 1}`} 
                                                className="w-full h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
                                                onClick={() => setModalImage(url)} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Donation Box and Chat Button */}
                        <div className="md:col-span-1">
                            <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100 sticky top-24 shadow-sm">
                                
                                {/* Stats and Progress Bar */}
                                <div className="mb-4">
                                    <span className="block text-gray-500 text-sm mb-1">Raised so far</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold text-brand-300">${request.collected_amount}</span>
                                        <span className="text-gray-400 font-medium">of ${request.goal_amount}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-white rounded-full h-3 mb-6 border border-brand-100 overflow-hidden">
                                    <div 
                                        className="bg-brand-300 h-3 rounded-full transition-all duration-1000" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                
                                {/* --- NEW CHAT BUTTON --- */}
                                {/* Only show chat button if user is logged in AND is NOT the requester */}
                                {user && !isRequester && (
                                    <button 
                                        onClick={handleInitiateChat}
                                        className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition border border-gray-300 mb-4"
                                    >
                                        Chat with Requester
                                    </button>
                                )}
                                

                                {/* Donate Section */}
                                <div className="space-y-4">
                                    {!user && (
                                        <div className="bg-brand-200/50 p-3 rounded-lg text-sm text-brand-300 font-semibold text-center border-brand-200">
                                            Please <Link to="/login" className="underline">log in</Link> to donate.
                                        </div>
                                    )}
                                    
                                    {/* Input Field and Donate Button */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter Amount ($)</label>
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="50"
                                            className="w-full border border-gray-300 rounded-xl p-3 text-lg font-bold text-gray-700 focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-300"
                                            disabled={!user || donating}
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={handleDonate}
                                        disabled={!user || donating}
                                        className="w-full bg-brand-300 text-white font-bold py-4 rounded-xl hover:bg-brand-200 transition shadow-lg shadow-brand-200/50 disabled:bg-gray-300"
                                    >
                                        {donating ? "Processing..." : "Donate Now"}
                                    </button>
                                </div>
                                
                                <p className="text-xs text-center text-gray-400 mt-4">Secure donation powered by Stripe</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetails;