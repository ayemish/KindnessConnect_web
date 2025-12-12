// components/Footer.jsx 

import { Link } from 'react-router-dom';
import { useSponsor } from '../context/SponsorContext';

const Footer = () => {
    const { theme } = useSponsor();

    return (
        <footer className={`bg-gray-100 border-t ${theme.isActive ? 'border-brand-300' : 'border-gray-200'} mt-12`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center flex-wrap">
                
                {/* Brand Name */}
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} KindnessConnect. All rights reserved.
                </p>

                {/* Sponsorship and Verification Links Area */}
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    
                    {/* NEW VERIFICATION LINK */}
                    <Link to="/verify" className="text-sm font-semibold text-brand-300 hover:text-brand-200 transition">
                        Verify your Account
                    </Link>
                    
                    <Link to="/sponsor" className="text-sm font-semibold text-brand-300 hover:text-brand-200 transition">
                        Sponsor KindnessConnect
                    </Link>
                </div>
            </div>

            {/* Active Sponsor Banner (if applicable) */}
            {theme.isActive && theme.logoUrl && (
                <div className="bg-brand-50 border-t border-brand-300 py-3 text-center">
                    <a href={theme.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-brand-300 transition">
                        <img src={theme.logoUrl} alt={`${theme.sponsorName} logo`} className="h-6 mr-2 object-contain" />
                        Proudly sponsored this week by <span className="font-bold ml-1">{theme.sponsorName}</span>
                    </a>
                </div>
            )}
        </footer>
    );
};

export default Footer;