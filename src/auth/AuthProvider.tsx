import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  userRole: "admin" | "employee" | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "employee" | null>(null);

  
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    setCurrentUser(firebaseUser);

    if (firebaseUser) {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      // Create user doc if it doesn't exist
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          role: "employee",
          email: firebaseUser.email,
          createdAt: serverTimestamp(),
        });
      }

      const roleFromDb = userDoc.exists() ? (userDoc.data()?.role as "admin" | "employee") : "employee";
      setUserRole(roleFromDb);
    } else {
      setUserRole(null);
    }
  });

  return () => unsubscribe();
}, []);


  
  const login = async (email: string, password: string): Promise<void> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const roleFromDb = userDoc.exists() ? (userDoc.data()?.role as "admin" | "employee") : null;
    setUserRole(roleFromDb);
    setCurrentUser(user);
  };

 
  const logout = async (): Promise<void> => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
