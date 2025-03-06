
import React from "react";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-red-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-[#ea384c]/20 animate-fade-in">
          <img 
            src="/lovable-uploads/4fc43751-b8dd-4328-872a-45392c5523f0.png" 
            alt="How Kee Frozen Foods Logo" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <Loader2 className="h-10 w-10 text-[#ea384c] animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Dashboard />;
};

export default DashboardPage;
