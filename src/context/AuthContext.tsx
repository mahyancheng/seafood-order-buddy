
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Types
export interface User {
  id: string;
  name: string;
  role: "salesperson" | "admin";
}

export interface UserWithCredentials extends User {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // User management
  allUsers: UserWithCredentials[];
  addUser: (name: string, email: string, password: string, role: "salesperson" | "admin") => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<Omit<UserWithCredentials, "id">>) => void;
}

// Mock users (in a real app, this would come from an API/database)
const INITIAL_USERS = [
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
  const [allUsers, setAllUsers] = useState<UserWithCredentials[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize users from localStorage or default to mock users
  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      try {
        setAllUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error("Failed to parse stored users:", error);
        setAllUsers(INITIAL_USERS);
        localStorage.setItem("users", JSON.stringify(INITIAL_USERS));
      }
    } else {
      setAllUsers(INITIAL_USERS);
      localStorage.setItem("users", JSON.stringify(INITIAL_USERS));
    }

    // Check if user is already logged in (from localStorage)
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
      // Find user in stored data
      const matchedUser = allUsers.find(
        (u) => u.email === email && u.password === password
      );
      
      if (matchedUser) {
        // Create user object without password
        const { password, ...userWithoutPassword } = matchedUser;
        setUser(userWithoutPassword);
        
        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        
        // Show success message
        toast.success(`Welcome back, ${userWithoutPassword.name}`);
        
        // Redirect based on role
        if (userWithoutPassword.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
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

  // Add new user
  const addUser = (name: string, email: string, password: string, role: "salesperson" | "admin") => {
    // Check if email already exists
    if (allUsers.some(u => u.email === email)) {
      toast.error("A user with this email already exists");
      return;
    }
    
    const newUser: UserWithCredentials = {
      id: uuidv4(),
      name,
      email,
      password,
      role
    };
    
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    toast.success(`${name} has been added as a ${role}`);
  };
  
  // Remove user
  const removeUser = (userId: string) => {
    // Prevent removing the current user
    if (user?.id === userId) {
      toast.error("You cannot remove your own account");
      return;
    }
    
    // Prevent removing the last admin
    const userToRemove = allUsers.find(u => u.id === userId);
    const adminCount = allUsers.filter(u => u.role === "admin").length;
    
    if (userToRemove?.role === "admin" && adminCount <= 1) {
      toast.error("Cannot remove the last admin account");
      return;
    }
    
    const updatedUsers = allUsers.filter(u => u.id !== userId);
    setAllUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    toast.success("User has been removed");
  };
  
  // Update user
  const updateUser = (userId: string, updates: Partial<Omit<UserWithCredentials, "id">>) => {
    // Prevent changing the role of the last admin
    if (updates.role && updates.role !== "admin") {
      const userToUpdate = allUsers.find(u => u.id === userId);
      const adminCount = allUsers.filter(u => u.role === "admin").length;
      
      if (userToUpdate?.role === "admin" && adminCount <= 1) {
        toast.error("Cannot change role of the last admin");
        return;
      }
    }
    
    const updatedUsers = allUsers.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    
    setAllUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // If updating current user, update the current user state and localStorage
    if (user?.id === userId) {
      const { password, email, ...userWithoutCredentials } = updatedUsers.find(u => u.id === userId)!;
      setUser(userWithoutCredentials);
      localStorage.setItem("user", JSON.stringify(userWithoutCredentials));
    }
    
    toast.success("User information updated");
  };

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
    allUsers,
    addUser,
    removeUser,
    updateUser
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
