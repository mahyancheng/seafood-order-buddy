
import React from "react";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect based on role
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md mb-10 text-center animate-slide-down">
        <h1 className="text-3xl font-medium mb-2">Seafood Wholesale</h1>
        <p className="text-muted-foreground">Order Management System</p>
      </div>
      <LoginForm />
      <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in">
        <p>Demo Credentials:</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="border rounded-md p-2">
            <p className="font-medium mb-1">Salesperson</p>
            <p>Email: john@seafood.com</p>
            <p>Password: password123</p>
          </div>
          <div className="border rounded-md p-2">
            <p className="font-medium mb-1">Admin</p>
            <p>Email: admin@seafood.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
