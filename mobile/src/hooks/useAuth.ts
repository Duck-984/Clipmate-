import { useState, useEffect } from "react";
import { authStore } from "../services/api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await authStore.getUser();
      const token = await authStore.getToken();
      if (u && token) setUser(u);
      setLoading(false);
    })();
  }, []);

  const login = async (userData: any, token: string) => {
    await authStore.setToken(token);
    await authStore.setUser(userData);
    setUser(userData);
  };

  const logout = async () => {
    await authStore.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
}
