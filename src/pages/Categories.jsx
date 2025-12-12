import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { parseISO, isPast } from 'date-fns'; 

const Categories = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get('/requests/');
                // Only show verified requests
                const approvedRequests = response.data.filter(req => req.status === 'verified');
                setRequests(approvedRequests);
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // Helper function to safely get a Date object or a fallback epoch date
    // Note: Kept the safe parse logic in case this date is used for any other logic later
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
            console.warn("Date parse error for:", dateString);
            return new Date(0); 
        }
    };

    // Filter Logic
    const filteredRequests = selectedCategory === "All" 
        ? requests 
        : requests.filter(req => req.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-7xl mx-auto">
                
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Explore Causes</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Find a cause close to your heart. Whether it's medical aid, education, or emergency relief, your support changes lives.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {['All', 'Medical', 'Education', 'Welfare', 'Emergency'].map((cat) => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full border transition font-medium ${
                                selectedCategory === cat 
                                ? 'bg-brand-300 text-white border-brand-300 shadow-md' 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="text-center py-20 text-brand-300 font-bold">Loading campaigns...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRequests.length === 0 ? (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100">
                                <p className="text-gray-500 text-lg">No active campaigns found in <span className="font-bold text-brand-300">{selectedCategory}</span>.</p>
                                <button onClick={() => setSelectedCategory("All")} className="mt-4 text-brand-300 underline">View All</button>
                            </div>
                        ) : (
                            filteredRequests.map((req) => {
                                
                                const isFunded = req.collected_amount >= req.goal_amount;
                                
                                const cardClasses = `bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition flex flex-col h-full ${
                                    isFunded ? 'opacity-70 bg-gray-200 border-gray-300 hover:shadow-sm' : 'hover:shadow-md'
                                }`;
                                
                                const linkClasses = isFunded
                                    ? "block w-full text-center bg-gray-300 text-gray-600 font-bold py-3 rounded-xl transition mt-auto"
                                    : "block w-full text-center bg-brand-50 text-brand-300 font-bold py-3 rounded-xl hover:bg-brand-300 hover:text-white transition mt-auto";
                                
                                return (
                                    <div key={req.id} className={cardClasses}>
                                        
                                        {/* Image */}
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={req.image_url} alt={req.title} className="w-full h-full object-cover"/>
                                            <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-brand-300 uppercase">{req.category}</span>
                                        </div>

                                        {/* Content */}
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
                                                {isFunded && <p className="text-xs text-green-600 font-semibold mt-1">Goal Reached!You can still donate</p>}
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
            </div>
        </div>
    );
};

export default Categories;