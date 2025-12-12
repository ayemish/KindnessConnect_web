import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useSponsor } from '../context/SponsorContext';

// --- SponsorDetailModal Component ---
const SponsorDetailModal = ({ sponsor, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Sponsor Details: {sponsor.sponsor_name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Column 1: Contact & Deal */}
                    <div>
                        <h4 className="font-bold text-gray-700 mb-2 border-l-4 border-brand-300 pl-2">Contact & Deal Information</h4>
                        <p className="py-1"><strong>Email:</strong> {sponsor.contact_email}</p>
                        <p className="py-1"><strong>Website:</strong> <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{sponsor.website_url || 'N/A'}</a></p>
                        <p className="py-1"><strong>Deal ID:</strong> {sponsor.deal_id}</p>
                        <p className="py-1"><strong>Status:</strong> <span className={`font-semibold ${
                            sponsor.status === 'approved' ? 'text-green-600' : sponsor.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                        }`}>{sponsor.status.toUpperCase()}</span></p>
                    </div>

                    {/* Column 2: Branding */}
                    <div>
                        <h4 className="font-bold text-gray-700 mb-2 border-l-4 border-brand-300 pl-2">Branding Details</h4>
                        <p className="flex items-center py-1">
                            <strong>Primary Color:</strong> 
                            <span style={{ backgroundColor: sponsor.primary_color_hex }} className="w-4 h-4 inline-block rounded border ml-2 mr-1"></span>
                            <span className="font-mono text-xs">{sponsor.primary_color_hex}</span>
                        </p>
                        <p className="flex items-center py-1">
                            <strong>Light BG Color:</strong> 
                            <span style={{ backgroundColor: sponsor.light_bg_hex }} className="w-4 h-4 inline-block rounded border ml-2 mr-1"></span>
                            <span className="font-mono text-xs">{sponsor.light_bg_hex}</span>
                        </p>
                        <p className="py-1">
                            <strong>Theme Active:</strong> {sponsor.is_active_theme ? 'Yes' : 'No'}
                        </p>
                        <img src={sponsor.logo_url} alt="Logo" className="mt-3 h-12 w-auto object-contain border p-1 rounded bg-gray-50" />
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- ColorEditModal Component ---
const ColorEditModal = ({ sponsor, onClose, onSave }) => {
    const [tempPrimary, setTempPrimary] = useState(sponsor.primary_color_hex);
    const [tempLightBg, setTempLightBg] = useState(sponsor.light_bg_hex);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(sponsor.id, tempPrimary, tempLightBg);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Edit Colors for {sponsor.sponsor_name}</h3>
                
                {/* Color Input 1: Primary Accent Color */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Primary Accent Color (HEX)</label>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="color" 
                            value={tempPrimary} 
                            onChange={(e) => setTempPrimary(e.target.value)}
                            className="w-12 h-10 border rounded p-1"
                        />
                        <input 
                            type="text" 
                            value={tempPrimary} 
                            onChange={(e) => setTempPrimary(e.target.value)}
                            className="flex-1 border rounded-lg p-2 font-mono text-sm"
                        />
                        <div style={{ backgroundColor: tempPrimary }} className="w-8 h-8 rounded-full border shadow-inner"></div>
                    </div>
                </div>

                {/* Color Input 2: Light Background Color */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1">Light Background Color (HEX)</label>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="color" 
                            value={tempLightBg} 
                            onChange={(e) => setTempLightBg(e.target.value)}
                            className="w-12 h-10 border rounded p-1"
                        />
                        <input 
                            type="text" 
                            value={tempLightBg} 
                            onChange={(e) => setTempLightBg(e.target.value)}
                            className="flex-1 border rounded-lg p-2 font-mono text-sm"
                        />
                        <div style={{ backgroundColor: tempLightBg }} className="w-8 h-8 rounded-full border shadow-inner"></div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-white bg-brand-300 rounded hover:bg-brand-200 disabled:bg-gray-400 transition">
                        {isSaving ? 'Saving...' : 'Save Colors'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminSponsors = () => {
    const { user, loading: authLoading } = useAuth();
    const { fetchActiveTheme } = useSponsor(); 
    const navigate = useNavigate();

    const [sponsors, setSponsors] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [editingSponsor, setEditingSponsor] = useState(null); 
    const [viewingSponsor, setViewingSponsor] = useState(null); 
    const adminUid = user?.uid;

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            alert("Access Denied: Administrative privileges required.");
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    const fetchSponsors = async () => {
        if (!adminUid) return;
        setDataLoading(true);
        try {
            const response = await api.get('/sponsors/', { params: { admin_uid: adminUid } });
            setSponsors(response.data || []);
        } catch (error) {
            console.error("Error fetching sponsors:", error);
            alert("Failed to retrieve sponsor data.");
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchSponsors();
        }
    }, [user]);

    const handleSaveColors = async (sponsorId, primaryHex, lightBgHex) => {
        try {
            const payload = { 
                primary_color_hex: primaryHex, 
                light_bg_hex: lightBgHex 
            };
            
            await api.put(`/sponsors/${sponsorId}`, payload, {
                params: { admin_uid: adminUid }
            });
            
            alert('Colors updated successfully.');
            setEditingSponsor(null);
            
            await fetchActiveTheme(); 
            fetchSponsors(); 
            
        } catch (error) {
            console.error("Color update failed:", error);
            alert("Failed to update colors.");
        }
    };

    const handleUpdate = async (sponsorId, status = null, activate = null) => {
        const actionName = activate === true ? 'ACTIVATE THEME' : activate === false ? 'DEACTIVATE THEME' : status.toUpperCase();
        if (!window.confirm(`Are you sure you want to proceed with ${actionName}?`)) return;

        try {
            const payload = {};
            if (status) payload.status = status;
            
            if (activate !== null) {
                payload.is_active_theme = activate;
            }

            if (Object.keys(payload).length === 0) return;

            await api.put(`/sponsors/${sponsorId}`, payload, {
                params: { admin_uid: adminUid }
            });
            
            alert('Update successful.');
            
            if (activate !== null) {
                await fetchActiveTheme();
            }
            fetchSponsors(); 
            
        } catch (error) {
            console.error("Update failed:", error);
            alert("Update failed. Check console for details.");
        }
    };
    
    const ColorSwatch = ({ hex }) => (
        <span style={{ backgroundColor: hex }} className="w-5 h-5 inline-block rounded-full border border-gray-300 shadow-sm ml-1" title={hex}></span>
    );

    if (authLoading || dataLoading || user?.role !== 'admin') {
        return <div className="p-10 text-center text-gray-500">Loading Administrative Panel...</div>;
    }

    return (
        <div className="min-h-screen py-10 max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-semibold mb-8 border-b pb-3">Sponsor Management Dashboard</h1>

            <div className="space-y-6">
                {sponsors.length === 0 ? (
                    <p className="text-gray-500">No sponsorship requests found.</p>
                ) : (
                    sponsors.map((s) => (
                        <div 
                            key={s.id} 
                            
                            className={`p-5 border rounded-xl shadow-md transition cursor-pointer 
                            ${s.is_active_theme ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'}
                            hover:shadow-lg`}
                            onClick={() => setViewingSponsor(s)} 
                        >
                            <div className="flex justify-between items-start pointer-events-none"> 
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-800">{s.sponsor_name}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">{s.contact_email}</p>
                                    <p className="text-xs mt-2">
                                        Current Status: 
                                        <span className={`font-semibold ml-1 ${s.status === 'approved' ? 'text-green-600' : s.status === 'pending' ? 'text-orange-500' : 'text-red-500'}`}>
                                            {s.status.toUpperCase()}
                                        </span>
                                        {s.is_active_theme && <span className="text-brand-300 ml-3 font-semibold"> (Active Site Theme)</span>}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <img src={s.logo_url} alt="Logo" className="h-10 w-auto object-contain mb-2 border p-1 rounded bg-white shadow-sm" />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Primary: <ColorSwatch hex={s.primary_color_hex} />
                                        | BG: <ColorSwatch hex={s.light_bg_hex} />
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons Section */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 flex-wrap">
                                
                                
                                <button onClick={(e) => {e.stopPropagation(); setEditingSponsor(s);}} className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold">
                                    Edit Colors
                                </button>

                                {s.status === 'pending' && (
                                    <>
                                     
                                        <button onClick={(e) => {e.stopPropagation(); handleUpdate(s.id, 'approved');}} className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold">
                                            Approve
                                        </button>
                                      
                                        <button onClick={(e) => {e.stopPropagation(); handleUpdate(s.id, 'rejected');}} className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold">
                                            Reject
                                        </button>
                                    </>
                                )}
                                
                                {s.status === 'approved' && !s.is_active_theme && (
                                    /* Activate Theme Button - BRAND PRIMARY */
                                    <button onClick={(e) => {e.stopPropagation(); handleUpdate(s.id, null, true);}} className="bg-brand-300 text-white px-3 py-1.5 text-sm rounded hover:bg-brand-200 transition font-semibold">
                                        Activate Theme
                                    </button>
                                )}

                                {s.is_active_theme && (
                                    /* Deactivate Theme Button - Gray/Neutral */
                                    <button onClick={(e) => {e.stopPropagation(); handleUpdate(s.id, null, false);}} className="bg-gray-500 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-600 transition font-semibold">
                                        Deactivate Theme
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Modals Rendering */}
            {editingSponsor && (
                <ColorEditModal 
                    sponsor={editingSponsor} 
                    onClose={() => setEditingSponsor(null)} 
                    onSave={handleSaveColors}
                />
            )}
            {viewingSponsor && ( 
                <SponsorDetailModal
                    sponsor={viewingSponsor}
                    onClose={() => setViewingSponsor(null)}
                />
            )}
        </div>
    );
};

export default AdminSponsors;