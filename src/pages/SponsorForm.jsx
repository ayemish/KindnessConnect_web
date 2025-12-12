// pages/SponsorForm.jsx

import { useState, useEffect } from 'react';
import api from '../api/api';

const SponsorForm = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dealsLoading, setDealsLoading] = useState(true);
    const [formData, setFormData] = useState({
        sponsor_name: '',
        contact_email: '',
        deal_id: '',
        primary_color_hex: '#FD7979',
        light_bg_hex: '#FEEAC9',
        website_url: '',
        logo_file: null,
    });

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const response = await api.get('/sponsors/deals');
                setDeals(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, deal_id: response.data[0].id }));
                }
            } catch (error) {
                console.error("Error fetching deals:", error);
            } finally {
                setDealsLoading(false);
            }
        };
        fetchDeals();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, logo_file: e.target.files[0] });
    };

    // --- NEW THEME GENERATION HANDLER ---
    const handleGenerateTheme = async () => {
        if (!formData.logo_file) {
            return alert("Please upload your logo file first to generate a theme.");
        }

        setLoading(true); 
        
        try {
            const fileData = new FormData();
            fileData.append('logo_file', formData.logo_file); 

            const response = await api.post('/sponsors/generate_theme', fileData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.primary_color_hex) {
                setFormData(prev => ({ 
                    ...prev, 
                    primary_color_hex: response.data.primary_color_hex, 
                    light_bg_hex: response.data.light_bg_hex 
                }));
                alert("Theme colors generated successfully! You can review and adjust them below.");
            } else {
                alert("Theme generation failed or returned empty data.");
            }

        } catch (error) {
            console.error("Theme generation failed:", error);
            alert(error.response?.data?.detail || "Failed to generate theme. Check network connection or backend logs.");
        } finally {
            setLoading(false);
        }
    };
  

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.logo_file) return alert("Logo file is mandatory.");

        setLoading(true);
        try {
            const data = new FormData();
            // Append all fields (including the currently selected colors)
            Object.keys(formData).forEach(key => {
                if (key !== 'logo_file') {
                    data.append(key, formData[key]);
                }
            });
            data.append('logo_file', formData.logo_file);

            // This is the ONLY API call in this function
            await api.post('/sponsors/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Sponsorship request submitted successfully! We will contact you soon.");
            setFormData({ // Reset form after submission
                sponsor_name: '', contact_email: '', deal_id: deals[0]?.id || '',
                primary_color_hex: '#FD7979', light_bg_hex: '#FEEAC9', website_url: '', logo_file: null,
            });

        } catch (error) {
            console.error("Sponsor submission failed:", error);
            alert("Failed to submit sponsorship. Check console.");
        } finally {
            setLoading(false);
        }
    };

    if (dealsLoading) return <div className="p-10 text-center">Loading sponsor deals...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-brand-50">
                <h1 className="text-3xl font-bold text-gray-800 mb-2"> Become a Sponsor</h1>
                <p className="text-gray-500 mb-8">Support our mission and showcase your brand to a compassionate community.</p>

                <h2 className="text-xl font-bold text-brand-300 mb-4">Sponsorship Deals</h2>
                <ul className="space-y-2 mb-6 p-4 border rounded-xl bg-brand-50/50">
                    {deals.map(deal => (
                        <li key={deal.id} className="flex justify-between font-medium">
                            <span>{deal.name} ({deal.duration_days} days)</span>
                            <span className="text-green-600">${deal.price_usd.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>

                <h2 className="text-xl font-bold text-brand-300 pt-4 mt-6 border-t border-brand-50 mb-4">Your Branding Details</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Basic Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Company Name</label>
                            <input type="text" name="sponsor_name" required onChange={handleChange} value={formData.sponsor_name}
                                className="w-full border rounded-xl p-3 focus:border-brand-300" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Contact Email</label>
                            <input type="email" name="contact_email" required onChange={handleChange} value={formData.contact_email}
                                className="w-full border rounded-xl p-3 focus:border-brand-300" />
                        </div>
                    </div>

                    {/* Deal and Website */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Select Deal</label>
                            <select name="deal_id" onChange={handleChange} value={formData.deal_id} required
                                className="w-full border rounded-xl p-3 bg-white focus:border-brand-300">
                                {deals.map(deal => (
                                    <option key={deal.id} value={deal.id}>
                                        {deal.name} (${deal.price_usd.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Website URL (Optional)</label>
                            <input type="url" name="website_url" onChange={handleChange} value={formData.website_url}
                                className="w-full border rounded-xl p-3 focus:border-brand-300" />
                        </div>
                    </div>
                    
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Company Logo (Mandatory)</label>
                        <input type="file" name="logo_file" accept="image/*" required onChange={handleFileChange}
                            className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-300 hover:file:bg-brand-100" />
                    </div>

                    {/* Theme Generation Button */}
                   
                    <button 
                        type="button" 
                        onClick={handleGenerateTheme} 
                        disabled={loading || !formData.logo_file}
                        className="w-full bg-green-600 text-white font-bold py-2 rounded-xl hover:bg-green-700 transition disabled:bg-gray-400">
                        {loading ? 'Analyzing Logo...' : 'Generate Theme from Logo'}
                    </button>

                    {/* Color Theme (User Input) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Primary Accent Color (HEX)</label>
                            <input type="color" name="primary_color_hex" onChange={handleChange} value={formData.primary_color_hex}
                                className="w-full h-10 border rounded-xl p-1" />
                            <p className="text-xs text-gray-500 mt-1">Example: #FD7979 (This will replace the red/coral accents)</p>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Light Background Color (HEX)</label>
                            <input type="color" name="light_bg_hex" onChange={handleChange} value={formData.light_bg_hex}
                                className="w-full h-10 border rounded-xl p-1" />
                            <p className="text-xs text-gray-500 mt-1">Example: #FEEAC9 (This will replace the very light backgrounds)</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-300 text-white font-bold py-4 rounded-xl hover:bg-brand-200 transition shadow-lg shadow-brand-200/50 disabled:bg-gray-300">
                        {loading ? "Submitting Request..." : "Submit Sponsorship Request"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SponsorForm;