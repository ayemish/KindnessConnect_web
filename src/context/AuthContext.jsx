import { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signOut,
    sendEmailVerification,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword 
    
} from 'firebase/auth';
import { auth } from '../api/firebase'; 
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Sign Up Function ---
    const signup = async (email, password, fullName, role = 'donor') => {
        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Send Email Verification Link immediately after creation
        await sendEmailVerification(firebaseUser); 

        // 2. Register user profile in your FastAPI backend
        const userPayload = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: fullName,
            role: role, 
        };
        
        try {
            await api.post('/users/signup', userPayload);
            
            // Log out the user immediately so they must log in AFTER verifying the email
            await signOut(auth); 

            return { needsVerification: true };
            
        } catch (error) {
            console.error("FastAPI user profile creation failed:", error);
            throw error; 
        }
    };

    // --- Login Function ---
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        let firebaseUser = userCredential.user;

        //  Reload the user object to get the latest emailVerified status
        await firebaseUser.reload(); 
        firebaseUser = auth.currentUser; // Get the reloaded user object

        // 1. Check Email Verification Status using the reloaded data
        if (!firebaseUser.emailVerified) {
            // Sign them out of the current session immediately, blocking access
            await signOut(auth); 
            // Throw a custom error that Login.js catches
            throw new Error("Email address not verified. Please check your inbox and follow the verification link.");
        }
        
        // If verified, the onAuthStateChanged listener will run and fetch the profile.
        return firebaseUser;
    };
    
    // --- Existing Logout Function ---
    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get ID token to authenticate request with the backend
                    const token = await firebaseUser.getIdToken();
                    
                    // 1. Fetch complete user profile from your FastAPI backend
                    const response = await api.get('/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // 2. Set the complete, authoritative profile data from the backend
                    setUser(response.data); 
                    
                } catch (error) {
                    console.error("Failed to fetch secure profile, forcing logout:", error);
                    await signOut(auth);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout, signup, login }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};