import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // We assume any authenticated user is an admin for now
      setIsAdmin(!!currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { session: user, user, isAdmin, loading };
}