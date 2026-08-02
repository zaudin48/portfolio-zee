import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  return { user, loading: user === undefined };
}
