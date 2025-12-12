import { useState } from 'react';
import api from '../api/api'; 
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const Signup = () => {
    const navigate = useNavigate();
    const { user, signup: contextSignup } = useAuth(); 
    
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
    });

    // --- Redirect if already logged in ---
    if (user) {
        navigate('/');
        return null; 
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Basic client-side validation
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }
        
        setIsSubmitting(true);

        try {
            // Calling the centralized signup logic from AuthContext
            const result = await contextSignup( 
                formData.email, 
                formData.password, 
                formData.fullName, 
                'donor',
                formData.phone
            );

            // 🔑 CRITICAL FIX: Handle the verification flag returned by AuthContext
            if (result && result.needsVerification) {
                alert("Success! A verification link has been sent to your email. Please verify your address before logging in.");
                navigate('/login'); // Force user to the login screen to wait for verification
            } else {
                 // Fallback if verification was bypassed (e.g., in testing environment)
                 alert("Account created successfully! Welcome.");
                 navigate('/'); 
            }

        } catch (error) {
            console.error("Signup Error:", error);
            // Firebase error messages are usually in error.message
            const errorMessage = error.message || 'Signup failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-brand-50">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create Your Account
                    </h2>
                </div>
                
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="space-y-4">
                        <input
                            name="fullName"
                            type="text"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-300 focus:border-brand-300 sm:text-sm"
                            placeholder="Full Name"
                            onChange={handleChange}
                        />
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-300 focus:border-brand-300 sm:text-sm"
                            placeholder="Email address"
                            onChange={handleChange}
                        />
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-300 focus:border-brand-300 sm:text-sm"
                            placeholder="Password (Min 6 characters)"
                            onChange={handleChange}
                        />
                        <input
                            name="phone"
                            type="text"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-300 focus:border-brand-300 sm:text-sm"
                            placeholder="Phone Number (for contact)"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-300 hover:bg-brand-200 transition disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Creating Account..." : "Sign Up"}
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-brand-300 hover:text-brand-200 font-medium">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;