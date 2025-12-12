import { useState } from 'react'; // Removed useEffect since it's no longer used
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 


const Login = () => {

    const navigate = useNavigate();
    const { user, loading: authLoading, login: contextLogin } = useAuth(); 
    
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // ❌ The redundant useEffect for redirection has been removed ❌

    // Show loading screen while checking initial authentication status
    if (authLoading) {
        return <div className="text-center py-20 text-gray-500">Checking session...</div>;
    }
    
    // If user is already logged in, return null
    if (user) {
        return null;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // 1. Authenticate using the context function (which enforces email verification)
            await contextLogin(email, password);
            
            // 2. Navigate ONLY if contextLogin resolves (i.e., user is verified)
            navigate('/');
            
        } catch (error) {
            console.error("Login Error:", error.message);

            // Retained mandatory verification error handling logic
            if (error.message.includes("Email address not verified")) {
                // Display the specific, actionable message to the user
                setError(error.message);
            } else {
                // Display generic failure message
                setError("Login failed. ");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-brand-50">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                
                {/* Display error messages, including the verification warning */}
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <input
                            type="email"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-300 focus:border-brand-300 sm:text-sm"
                            placeholder="Email address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-300 focus:border-brand-300 sm:text-sm"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-300 hover:bg-brand-200 transition disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Signing In..." : "Login"}
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
                        <Link to="/signup" className="text-sm text-brand-300 hover:text-brand-200 font-medium">
                            Don't have an account? Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;