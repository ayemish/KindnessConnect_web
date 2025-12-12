// pages/Home.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useSponsor } from '../context/SponsorContext'; 
import { parseISO, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';

// 1. IMPORT THE LOCAL IMAGE FILE
import defaultHeroImage from '../assets/kindnessLogo.jpeg'; 

const Home = () => {
 
    const { user } = useAuth(); 
    const { theme } = useSponsor(); 
    
    // useState Hooks
    const [requests, setRequests] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");


    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get('/requests/');
                const approvedRequests = response.data.filter(req => req.status === 'verified');
                setRequests(approvedRequests);
            } catch (error) {
                console.error("Error fetching requests:", error);
                setErrorMsg("Could not connect to Backend. Is it running?");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);
 

    // --- 2. HELPER FUNCTIONS AND LOGIC (Defined AFTER all Hooks) ---

    const safeParseDate = (dateString) => {
        if (!dateString) return new Date(0); 
        
        let correctedDateString = dateString;
        if (typeof dateString === 'string' && !dateString.endsWith('Z')) {
            if (dateString.includes('T')) {
                correctedDateString = dateString + 'Z';
            }
        }

        try {
            return parseISO(correctedDateString);
        } catch (e) {
            console.warn("Date parse error for:", dateString, e);
            return new Date(0); 
        }
    };

    const sortedAndFilteredRequests = () => {
        const filtered = selectedCategory === "All" 
            ? requests 
            : requests.filter(req => req.category === selectedCategory);

        return filtered.sort((a, b) => {
            const isEmergencyA = a.category === 'Emergency';
            const isEmergencyB = b.category === 'Emergency';
            
            // Emergency category first
            if (isEmergencyA && !isEmergencyB) return -1;
            if (!isEmergencyA && isEmergencyB) return 1;
            
            //  Sort by time (recent first)
            const createdA = safeParseDate(a.created_at);
            const createdB = safeParseDate(b.created_at);

            return createdB.getTime() - createdA.getTime();
        });
    };
    
    const filteredRequests = sortedAndFilteredRequests();

    const HeroImage = theme.isActive ? (
        <div className="flex-1 w-full max-w-md bg-white rounded-2xl shadow-xl flex items-center justify-center p-8">
            <img 
                src={theme.logoUrl} 
                alt={`${theme.sponsorName} logo`} 
                className="w-full h-auto max-h-64 object-contain" 
            />
        </div>
    ) : (
        <div className="flex-1 w-full max-w-md">
            <img 
               
                src={defaultHeroImage} 
                alt="Volunteers helping people" 
                className="w-full rounded-2xl shadow-xl" 
            />
        </div>
    );
    
    // --- SPONSOR MESSAGE Block ---
    const SponsorMessage = theme.isActive ? (
        <a 
            href={theme.websiteUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 mt-6 rounded-xl bg-brand-50/70 hover:bg-brand-50 transition shadow-sm text-center md:text-left"
        >
            <span className="text-sm font-medium text-gray-700">Proudly sponsored by:</span>
            <p className="text-xl font-extrabold text-brand-300 hover:text-brand-200 transition">
                {theme.sponsorName} Sponsor Week
            </p>
        </a>
    ) : null;


    return (
        <div className="min-h-screen bg-white">
            
            {/* --- HERO SECTION (Dynamically Themed) --- */}
            <section className="bg-brand-50/40 py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 text-center md:text-left space-y-6">
                        {/* Welcome Message (Conditional) */}
                        {user && (
                            <h2 className="text-xl font-semibold text-brand-300">
                                Welcome, {user.full_name || user.email.split('@')[0]}!
                            </h2>
                        )}

                        <h1 className="text-4xl md:text-6xl font-bold text-brand-300 leading-tight">
                            Connecting Hearts, <br />
                            <span className="text-gray-800">Changing Lives.</span>
                        </h1>
                        <p className="text-gray-600 text-lg">
                            KindnessConnect bridges the gap between those in need and compassionate donors.
                        </p>
                        
                        <div className="pt-4">
                            <Link 
                                to="/create" 
                                className="inline-block bg-brand-300 text-white text-lg px-8 py-3 rounded-full hover:bg-brand-200 transition font-semibold"
                            >
                                Start a Request
                            </Link>
                        </div>
                        

                        {SponsorMessage}
                        {/* ------------------------- */}

                    </div>
                    
                    {/* Dynamic Image/Logo */}
                    {HeroImage}

                </div>
            </section>



            {/* --- DONATION CARDS SECTION --- */}
            <section className="pb-20 max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                    {selectedCategory === "All" ? "Emergency Needs" : `${selectedCategory} Requests`}
                </h2>

                {errorMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p className="font-bold">Connection Error:</p>
                        <p>{errorMsg}</p>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-brand-300 font-bold">Loading donations...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRequests.length === 0 && !errorMsg ? (
                            <p className="text-gray-500">No active {selectedCategory} requests found.</p>
                        ) : (
                            filteredRequests.map((req) => {
                                // --- Funding Check ---
                                const isFunded = req.collected_amount >= req.goal_amount;
                                
                                const cardClasses = `bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition flex flex-col h-full ${
                                    isFunded ? 'opacity-70 bg-gray-200 border-gray-300 hover:shadow-sm' : 'hover:shadow-md'
                                }`;
                                
                                // Dynamic color/class for the link
                                const linkClasses = isFunded
                                    ? "block w-full text-center bg-gray-300 text-gray-600 font-bold py-3 rounded-xl transition mt-auto"
                                    : "block w-full text-center bg-brand-50 text-brand-300 font-bold py-3 rounded-xl hover:bg-brand-300 hover:text-white transition mt-auto";
                                
                                return (
                                    <div key={req.id} className={cardClasses}>
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={req.image_url} alt={req.title} className="w-full h-full object-cover"/>
                                            <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-brand-300 uppercase">{req.category}</span>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{req.title}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{req.story}</p>
                                            
                                            {/* Requester Info Block */}
                                            <div className="flex items-center text-sm font-semibold mb-3">
                                                <span className="text-gray-600 mr-2">
                                                    By: {req.requester_name || "Unknown Requester"} 
                                                </span>
                                                {req.requester_verified && (
                                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs flex items-center">
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Progress */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm font-semibold mb-1">
                                                    <span className="text-brand-300">${req.collected_amount}</span>
                                                    <span className="text-gray-400">of ${req.goal_amount}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className={`${isFunded ? 'bg-gray-400' : 'bg-brand-300'} h-2 rounded-full`} style={{ width: `${Math.min((req.collected_amount / req.goal_amount) * 100, 100)}%` }}></div>
                                                </div>
                                                {isFunded && <p className="text-xs text-green-600 font-semibold mt-1">Goal Reached! You can still donate.</p>}
                                            </div>

                                            <Link 
                                                to={`/requests/${req.id}`}
                                                className={linkClasses}
                                            >
                                                {isFunded ? 'View Details' : 'Donate Now'}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;