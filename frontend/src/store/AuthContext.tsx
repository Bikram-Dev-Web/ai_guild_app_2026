import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import authAPI from "../services/authAPI";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, username: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);

      if (response.data.user) {
        setUser(response.data.user);
        return response.data;
      }
    } catch (err: any) {
      const errorMsg = err.error || "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      const response = await authAPI.register(email, password, username);
      return response;
    } catch (err: any) {
      const errorMsg = err.error || "Signup failed";
      setError(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
