
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Types
export interface User {
  id: string;
  name: string;
  role: "salesperson" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Mock users (in a real app, this would come from an API/database)
const MOCK_USERS = [
  {
    id: "1",
    email: "john@seafood.com",
    password: "password123",
    name: "John Smith",
    role: "salesperson" as const,
  },
  {
    id: "2",
    email: "admin@seafood.com",
    password: "admin123",
    name: "Admin User",
    role: "admin" as const,
  },
];

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Find user in mock data
      const matchedUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );
      
      if (matchedUser) {
        // Create user object without password
        const { password, email, ...userWithoutPassword } = matchedUser;
        setUser(userWithoutPassword);
        
        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        
        // Show success message
        toast.success(`Welcome back, ${userWithoutPassword.name}`);
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("You have been logged out");
    navigate("/");
  };

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
