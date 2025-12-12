import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        alert("You have been logged out!");
    };
    
    const showBackButton = location.pathname !== '/';

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    
                    {/* Logo */}
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

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        
                        

                        <Link to="/" className="text-gray-600 hover:text-brand-300 font-medium transition">
                            Home
                        </Link>
                        <Link to="/categories" className="text-gray-600 hover:text-brand-300 font-medium transition">
                            Categories
                        </Link>
                        
                        {/* Action Buttons  */}
                        <div className="flex items-center gap-4 ml-4">

                            {user ? (
                                // --- USER IS LOGGED IN ---
                                <>
                                    {/* 1. Chats Link */}
                                    <Link 
                                        to="/chats" 
                                        className="text-gray-600 hover:text-brand-300 font-medium transition"
                                        title="Chat Inbox"
                                    >
                                        Chats
                                    </Link>
                                    
                                    {/* 2. Profile Link */}
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
                                // --- USER IS LOGGED OUT ---
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
        </nav>
    );
};

export default Navbar;