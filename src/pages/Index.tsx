
import React from "react";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
        <p className="mt-1">Email: john@seafood.com</p>
        <p>Password: password123</p>
      </div>
    </div>
  );
};

export default Index;
