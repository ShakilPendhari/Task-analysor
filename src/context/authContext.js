import { createContext, useContext, useEffect, useState } from "react";
import {
  signup as signupRequest,
  login as loginRequest,
  logout as logoutRequest,
  getCurrentUser,
} from "../service/auth.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const restoreUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    restoreUser();
  }, []);

  const login = async ({ email, password }) => {
    const result = await loginRequest({ email, password });
    const loggedInUser = result.user ?? { email };
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async ({ email, password }) => {
    const result = await signupRequest({ email, password });
    const newUser = result.user ?? { email };
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
