"use client";

import { createContext, useContext } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({ isLoggedIn: false });

export function useAuth() {
  return useContext(AuthContext);
}

export default function ClientWrapper({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) {
  return (
    <AuthContext.Provider value={{ isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
