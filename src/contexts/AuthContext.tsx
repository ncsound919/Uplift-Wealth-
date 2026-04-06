import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, fullName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name
    await updateProfile(userCredential.user, { displayName: fullName });

    // Create user document in Firestore
    const newUser: User = {
      id: userCredential.user.uid,
      email: email,
      fullName: fullName,
      goals: [],
      skills: [],
      subscriptionTier: 'Free',
      createdAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    setUserData(newUser);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Check if user document exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      const newUser: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        fullName: userCredential.user.displayName || '',
        goals: [],
        skills: [],
        subscriptionTier: 'Free',
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      setUserData(newUser);
    }
  }

  async function logout() {
    await signOut(auth);
    setUserData(null);
  }

  async function updateUserData(data: Partial<User>) {
    if (!currentUser) return;

    const base: User = userData ?? {
      id: currentUser.uid,
      email: currentUser.email || '',
      fullName: currentUser.displayName || '',
      goals: [],
      skills: [],
      subscriptionTier: 'Free',
      createdAt: new Date()
    };

    const updatedData: User = { ...base, ...data };
    await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });
    setUserData(updatedData);
  }

  async function loadUserData(user: FirebaseUser) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Convert Firestore Timestamp to Date for createdAt
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        data.createdAt = data.createdAt.toDate();
      }
      setUserData(data as User);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          await loadUserData(user);
        } else {
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
