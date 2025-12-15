import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext'; 

const CreateRequest = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth(); 
    
    const [formLoading, setFormLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false); 
  
    const [formData, setFormData] = useState({
        title: '',
        category: 'Medical',
        story: '', 
        goal_amount: '',
        deadline: '',
        bankAccount: '',
        bankName: '',
        requester_uid: '', 
        
        show_name_publicly: true,
        
        file: null, 
        galleryFiles: []
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            alert("Please log in to submit a new campaign.");
            navigate('/login');
        }
        // Set the requester_uid once the user object is available
        if (user && user.uid) {
            // Only update UID if it hasn't been set, prevents unnecessary re-renders
            if (formData.requester_uid !== user.uid) {
                setFormData(prev => ({ ...prev, requester_uid: user.uid }));
            }
        }
    }, [user, loading, navigate, formData.requester_uid]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, show_name_publicly: e.target.checked });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleGalleryFileChange = (e) => {
        // Convert FileList to Array
        setFormData({ ...formData, galleryFiles: Array.from(e.target.files) });
    };

    // --- AI Story Generation Handler ---
    const handleGenerateStory = async () => {
        // Destructure 'story' along with other fields
        const { title, category, goal_amount, story } = formData;
        
        if (!title || !category || !goal_amount || parseFloat(goal_amount) <= 0) {
            return alert("Please fill in the Campaign Title, Category, and a valid Goal Amount first.");
        }
        
        setIsGenerating(true);

        try {
            // Include the current 'story' value in the payload
            const response = await api.post('/requests/generate_story', {
                title,
                category,
                goal_amount: parseFloat(goal_amount),
                story: story // <--- Sends the current story draft for refinement/generation
            });

            if (response.data && response.data.story) {
                // Update the story field in formData state
                setFormData(prev => ({ ...prev, story: response.data.story })); 
            } else {
                alert("Could not generate story. The AI may be unavailable or gave an empty response.");
            }
            
        } catch (error) {
            console.error("Story generation failed:", error);
            //  Update alert message to reflect the current AI service (Gemini)
            alert("Failed to connect to Gemini AI service. Please check your GEMINI_API_KEY and backend logs.");
        } finally {
            setIsGenerating(false);
        }
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final check for mandatory fields
        if (!user || !formData.file) { 
            return alert("Authentication or Cover Image missing."); 
        }
        
        setFormLoading(true);

        try {
            // 1. Create 'FormData' object
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('story', formData.story);
            data.append('goal_amount', formData.goal_amount);
            data.append('deadline', formData.deadline);
            
            // Use the REAL UID from the authenticated user
            data.append('requester_uid', user.uid); 
            
            // Bank details
            data.append('bank_account_no', formData.bankAccount); 
            data.append('bank_name', formData.bankName); 
            
            // Append the privacy flag value
            data.append('show_name_publicly', formData.show_name_publicly); 
            
            // Files
            data.append('file', formData.file); 
            formData.galleryFiles.forEach((file) => {
                data.append('gallery_files', file);
            });

            // 2. Send to Backend
            await api.post('/requests/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Request Created Successfully! It is now pending admin review.");
            navigate('/profile'); // Redirect to Profile instead of home for better user experience
            
        } catch (error) {
            console.error("Error creating request:", error);
            alert("Failed to create request. Check console.");
        } finally {
            setFormLoading(false);
        }
    };

    // Prevent rendering the form while checking authentication
    if (loading) {
        return <div className="p-10 text-center text-gray-500">Checking authentication status...</div>;
    }
    
    // Final check after loading is complete
    if (!user) {
        return <div className="p-10 text-center text-red-500">Access Denied. Redirecting to Login...</div>;
    }


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-brand-50">
                
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Start a Fundraiser</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Campaign Details */}
                    <h3 className="text-xl font-bold text-brand-300">Campaign Details</h3>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Campaign Title</label>
                        <input 
                            type="text" 
                            name="title" 
                            required
                            placeholder="e.g. Urgent Medical Care for Baby Leo"
                            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-300"
                            onChange={handleChange}
                            value={formData.title} 
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Category</label>
                        <select 
                            name="category" 
                            className="w-full border border-gray-300 rounded-xl p-3 bg-white"
                            onChange={handleChange}
                            value={formData.category} 
                        >
                            <option value="Medical">Medical</option>
                            <option value="Education">Education</option>
                            <option value="Welfare">Welfare</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>

                    {/* Story Textarea with AI Button */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">The Story</label>
                        <div className="relative">
                            <textarea 
                                name="story" 
                                required
                                rows="6" 
                                placeholder="Tell donors why this matters..."
                                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-300 pr-32" // Added padding for button
                                onChange={handleChange}
                                value={formData.story}
                                disabled={isGenerating}
                            ></textarea>
                            
                            
                            <button 
                                type="button"
                                onClick={handleGenerateStory}
                                disabled={isGenerating || formLoading}
                                className="absolute top-2 right-2 bg-brand-300 text-white px-3 py-1 text-sm rounded-lg hover:bg-brand-200 transition disabled:bg-gray-400"
                            >
                                {isGenerating ? 'Generating...' : 'Generate Draft'}
                            </button>
                            
                        </div>
                    </div>
                    {/* End Story Textarea */}

                    {/* Goal & Deadline Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Goal Amount ($)</label>
                            <input 
                                type="number" 
                                name="goal_amount" 
                                required
                                className="w-full border border-gray-300 rounded-xl p-3"
                                onChange={handleChange}
                                value={formData.goal_amount} 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Deadline</label>
                            <input 
                                type="date" 
                                name="deadline" 
                                required
                                className="w-full border border-gray-300 rounded-xl p-3"
                                onChange={handleChange}
                                value={formData.deadline} 
                            />
                        </div>
                    </div>
                    
                    {/* Bank Details Section */}
                    <h3 className="text-xl font-bold text-brand-300 pt-4 mt-6 border-t border-brand-50">Receiving Funds</h3>
                    <p className="text-gray-500 text-sm -mt-4">
                        Funds will be transferred to this account upon successful verification.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Bank Name</label>
                            <input 
                                type="text" 
                                name="bankName" 
                                required
                                placeholder="e.g., Meezan Bank"
                                className="w-full border border-gray-300 rounded-xl p-3"
                                onChange={handleChange}
                                value={formData.bankName} 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Account / IBAN</label>
                            <input 
                                type="text" 
                                name="bankAccount" 
                                required
                                placeholder="e.g., 0101-123456789-00"
                                className="w-full border border-gray-300 rounded-xl p-3"
                                onChange={handleChange}
                                value={formData.bankAccount} 
                            />
                        </div>
                    </div>
                    
                    {/* Image Uploads */}
                    <h3 className="text-xl font-bold text-brand-300 pt-4 mt-6 border-t border-brand-50">Supporting Media</h3>
                    
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">1. Cover Image (Mandatory)</label>
                        <input 
                            type="file" 
                            name="file" 
                            accept="image/*"
                            required
                            className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-300 hover:file:bg-brand-100"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Optional Gallery Upload */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">2. Additional Images (Optional Gallery)</label>
                        <input 
                            type="file" 
                            name="galleryFiles" 
                            accept="image/*"
                            multiple // Allows multiple file selection
                            className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-300 hover:file:bg-brand-100"
                            onChange={handleGalleryFileChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">Select multiple images (e.g., medical reports, photos of the beneficiary).</p>
                    </div>
                    
                    {/* Privacy Checkbox for Name Display */}
                    <div className="pt-4 mt-6 border-t border-brand-50">
                        <label className="flex items-center space-x-3 text-gray-700 font-medium cursor-pointer">
                            <input 
                                type="checkbox"
                                name="show_name_publicly"
                                checked={formData.show_name_publicly}
                                onChange={handleCheckboxChange}
                                className="form-checkbox h-5 w-5 text-brand-300 rounded focus:ring-brand-300 border-gray-300"
                            />
                            <span>Display my full name on the campaign card.</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-8">Uncheck this box to remain anonymous (will show "Anonymous Donor").</p>
                    </div>


                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={formLoading || isGenerating}
                        className="w-full bg-brand-300 text-white font-bold py-4 rounded-xl hover:bg-brand-200 transition shadow-lg shadow-brand-200/50 disabled:bg-gray-300"
                    >
                        {formLoading ? "Creating Campaign..." : "Submit Request"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreateRequest;