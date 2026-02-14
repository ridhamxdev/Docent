import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
    updateProfile as firebaseUpdateProfile
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from "../lib/apiClient";

// Role types
export type UserRole = 'dentist' | 'student' | 'patient' | 'admin';

// User type with RBAC fields
export type User = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string;
    coverPhoto?: string;
    role?: UserRole;
    isVerified?: boolean;
    isOnboarded?: boolean;

    // Extended Profile Fields
    username?: string;
    bio?: string;
    about?: string;
    experience?: string;
    qualifications?: string;
    qualification?: string; // Legacy/Alternate
    clinicAddress?: string;
    address?: string;
    collegeName?: string;
    yearOfStudy?: string;
    locality?: string;
    age?: string;
    specialization?: string;
    practiceType?: string;
    documentUrl?: string;
    consultationFee?: number;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    updateProfile: (data: Partial<User>) => Promise<void>;
    updateProfilePhoto: (url: string) => Promise<void>;
    login: (email: string, password: string, role?: UserRole) => Promise<void>;
    register: (email: string, password: string, role: UserRole, additionalData?: any) => Promise<void>;
    loginWithGoogle: (role: UserRole) => Promise<void>;
    loginWithApple: (role: UserRole) => Promise<void>;
    handleSocialLoginSuccess: (user: FirebaseUser, role?: UserRole) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    updateProfile: async () => { },
    updateProfilePhoto: async () => { },
    login: async () => { },
    register: async () => { },
    loginWithGoogle: async () => { },
    loginWithApple: async () => { },
    handleSocialLoginSuccess: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // const router = useRouter(); // REMOVED: Cannot use inside non-child provider
    // const segments = useSegments(); // REMOVED
    const isRegisteringRef = useRef(false);

    useEffect(() => {
        let unsubscribeFirestore: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            // Cleanup previous firestore listener if any
            if (unsubscribeFirestore) {
                unsubscribeFirestore();
                unsubscribeFirestore = null;
            }

            if (firebaseUser) {
                // Subscribe to Firestore updates
                try {
                    // Need to handle this import carefully or just use the global getFirestore
                    const { onSnapshot, doc } = await import("firebase/firestore");

                    unsubscribeFirestore = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data() as Partial<User>;
                            setUser({
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL || undefined,
                                ...userData,
                            } as User);
                        } else {
                            // User deleted from Firestore - Force Logout if not registering
                            if (!isRegisteringRef.current) {
                                console.warn("User document not found in Firestore.");
                                setUser(null);
                                signOut(auth).catch(err => console.error("Force logout error", err));
                                // router.replace('/'); // UI should handle redirect on null user
                            } else {
                                // Fallback for new registration (doc might not be created yet)
                                setUser({
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    displayName: firebaseUser.displayName,
                                    role: 'patient', // Safe default
                                } as User);
                            }
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error("Firestore user listener error:", error);
                        setLoading(false);
                    });
                } catch (e) {
                    console.error("Error setting up firestore listener", e);
                    setLoading(false);
                }

            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeFirestore) unsubscribeFirestore();
        };
    }, []);

    const updateProfile = async (data: Partial<User>) => {
        if (!user || !auth.currentUser) return;

        try {
            // Update Firebase Auth profile if applicable
            if (data.displayName || data.photoURL) {
                await firebaseUpdateProfile(auth.currentUser, {
                    displayName: data.displayName || auth.currentUser.displayName,
                    photoURL: data.photoURL || auth.currentUser.photoURL
                });
            }

            // Update Firestore
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, data, { merge: true });

            // Update local state
            setUser(prev => prev ? { ...prev, ...data } : null);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const login = async (email: string, password: string, role?: UserRole) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);

            const userDoc = await getDoc(doc(db, "users", result.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Only enforce role check if a specific role is requested
                if (role && userData.role !== role) {
                    await signOut(auth);
                    throw new Error(`Invalid role. This account is registered as a ${userData.role}.`);
                }

                // Allow component to handle redirect using router
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (email: string, password: string, role: UserRole, additionalData: any = {}) => {
        isRegisteringRef.current = true;
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document
            const userData = {
                uid: result.user.uid,
                email,
                role,
                isVerified: role === 'dentist' ? false : true, // dentists need verification
                isOnboarded: false,
                createdAt: new Date().toISOString(),
                ...additionalData
            };

            await setDoc(doc(db, "users", result.user.uid), userData);

            // Sync with Backend (DynamoDB)
            try {
                await apiClient.post('/auth/register', {
                    uid: result.user.uid,
                    email,
                    password,
                    name: additionalData.displayName || "User",
                    role,
                    ...additionalData
                });
            } catch (backendError) {
                console.error("Backend sync failed:", backendError);
            }

            // Force refresh user to minimal state before redirect
            setUser(userData as User);

            // Allow component to handle redirect
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        } finally {
            isRegisteringRef.current = false;
        }
    };

    // ...


    const loginWithGoogle = async (role?: UserRole) => {
        // Placeholder: UI handles prompt
        console.warn("Google Login helper called. Ensure prompt is triggered from UI.");
    };

    const handleSocialLoginSuccess = async (firebaseUser: FirebaseUser, role?: UserRole) => {
        // Logic handled by component observing user state change
    };

    const loginWithApple = async () => {
        // Placeholder: UI handles prompt
    };

    // ...

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
        }
    };

    // Backward compatibility alias
    const updateProfilePhoto = async (url: string) => updateProfile({ photoURL: url });

    return (
        <AuthContext.Provider value={{ user, loading, updateProfile, updateProfilePhoto, login, register, loginWithGoogle, loginWithApple, handleSocialLoginSuccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
