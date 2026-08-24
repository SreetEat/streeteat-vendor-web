import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, setToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("streeteat_vendor_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [vendorId, setVendorId] = useState(() => {
    const raw = localStorage.getItem("streeteat_vendor_profile_id");
    return raw ? Number(raw) : null;
  });
  const [resolvingVendor, setResolvingVendor] = useState(false);

  const persistSession = useCallback((session) => {
    setToken(session.token);
    const nextUser = {
      userId: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    };
    localStorage.setItem("streeteat_vendor_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const setVendorProfileId = useCallback((id) => {
    localStorage.setItem("streeteat_vendor_profile_id", String(id));
    setVendorId(id);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("streeteat_vendor_user");
    localStorage.removeItem("streeteat_vendor_profile_id");
    setUser(null);
    setVendorId(null);
  }, []);

  // See customer app's AuthContext.jsx for the full explanation of why
  // this exists: a 401 from an expired/invalid token should trigger a
  // clean logout, not a raw error repeated on every request.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  useEffect(() => {
    if (!user || vendorId) return;
    setResolvingVendor(true);
    api
        .listAllVendors()
        .then((vendors) => {
          const match = vendors.find((v) => v.email === user.email);
          if (match) setVendorProfileId(match.id);
        })
        .finally(() => setResolvingVendor(false));
  }, [user, vendorId, setVendorProfileId]);

  const login = useCallback(
      async (email, password) => {
        const session = await api.login({ email, password });
        if (session.role !== "VENDOR") {
          throw new Error("This app is for vendor accounts only. Use the customer app instead.");
        }
        persistSession(session);
        return session;
      },
      [persistSession]
  );

  const register = useCallback(
      async ({ name, email, password, phone }) => {
        const session = await api.register({ name, email, password, phone, role: "VENDOR" });
        persistSession(session);
        return session;
      },
      [persistSession]
  );

  return (
      <AuthContext.Provider
          value={{ user, vendorId, resolvingVendor, setVendorProfileId, login, register, logout }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}