import React, { useState } from 'react'; // <-- 1. Import useState
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    // 2. State for controlling the mobile menu's open/close status
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false); // Close menu on logout
        alert("You have been logged out!");
    };
    
    const showBackButton = location.pathname !== '/';

    // Helper function to close the menu on link click
    const closeMenu = () => setIsMenuOpen(false);


    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    
                    {/* Left Side: Logo and Back Button */}
                    <div className="flex-shrink-0 flex items-center gap-4">
                        {showBackButton && (
                            <button 
                                onClick={() => navigate(-1)} 
                                className="text-gray-500 hover:text-brand-300 transition text-2xl font-bold p-1 rounded-full hover:bg-gray-100"
                                title="Go Back"
                            >
                                &larr; 
                            </button>
                        )}
                        <Link to="/" className="text-2xl font-bold text-brand-300 flex items-center gap-2">
                            KindnessConnect
                        </Link>
                    </div>

                    {/* 3. Hamburger Button (VISIBLE ON MOBILE ONLY) */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="text-gray-500 hover:text-brand-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-300"
                        >
                            {/* Toggle SVG based on state */}
                            {isMenuOpen ? (
                                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            ) : (
                                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            )}
                        </button>
                    </div>

                    {/* 4. Desktop Navigation Links (HIDDEN on mobile) */}
                    <div className="hidden md:flex items-center space-x-8">
                        
                        <Link to="/" className="text-gray-600 hover:text-brand-300 font-medium transition">
                            Home
                        </Link>
                        <Link to="/categories" className="text-gray-600 hover:text-brand-300 font-medium transition">
                            Categories
                        </Link>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 ml-4">
                            {user ? (
                                // --- USER IS LOGGED IN (DESKTOP) ---
                                <>
                                    <Link to="/chats" className="text-gray-600 hover:text-brand-300 font-medium transition" title="Chat Inbox">
                                        Chats
                                    </Link>
                                    <Link to="/profile" className="text-gray-600 hover:text-brand-300 font-medium transition">
                                        Profile
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-gray-600 hover:text-brand-300 font-medium transition py-2"
                                    >
                                        Logout
                                    </button>
                                    <Link to="/create" className="bg-brand-300 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-200 transition shadow-lg shadow-brand-200/50">
                                        Start a Request
                                    </Link>
                                </>
                            ) : (
                                // --- USER IS LOGGED OUT (DESKTOP) ---
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-brand-300 font-medium">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="bg-brand-300 text-white px-6 py-2.5 rounded-full font-medium hover:bg-brand-200 transition shadow-lg shadow-brand-200/50">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Mobile Menu (Toggled by isMenuOpen state) */}
            {/* The block style is applied based on the state, and it is hidden on medium screens and up */}
            <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100 bg-white">
                    <Link to="/" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-300">Home</Link>
                    <Link to="/categories" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-300">Categories</Link>
                    
                    {user ? (
                        // --- USER IS LOGGED IN (MOBILE) ---
                        <>
                            <Link to="/chats" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-300">Chats</Link>
                            <Link to="/profile" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-300">Profile</Link>

                            <Link to="/create" onClick={closeMenu} className="block w-full text-center bg-brand-300 text-white px-3 py-2 rounded-md font-medium hover:bg-brand-200 mt-2">
                                Start a Request
                            </Link>

                            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-500">
                                Logout
                            </button>
                        </>
                    ) : (
                        // --- USER IS LOGGED OUT (MOBILE) ---
                        <>
                            <Link to="/login" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-300">Login</Link>
                            <Link to="/signup" onClick={closeMenu} className="block w-full text-center bg-brand-300 text-white px-3 py-2 rounded-md font-medium hover:bg-brand-200 mt-2">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;