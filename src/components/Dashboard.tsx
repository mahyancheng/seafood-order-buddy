
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import OrderForm from "./OrderForm";
import OrderSummary from "./OrderSummary";
import OrderHistory from "./OrderHistory";
import MonthlyReport from "./MonthlyReport";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, UserRound, FileText, Package } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("newOrder");
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium">Seafood Orders</h1>
            <div className="hidden md:flex gap-2 items-center ml-4 text-sm">
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Salesperson Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary px-3 py-1.5 rounded-full text-sm">
              <UserRound className="h-4 w-4 mr-2 text-primary" />
              <span>{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Tabs defaultValue="newOrder" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="newOrder" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>New Order</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Order History</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Monthly Report</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="newOrder">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
              <div className="lg:col-span-4">
                <OrderForm />
              </div>
              <div className="lg:col-span-3">
                <OrderSummary />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <OrderHistory />
          </TabsContent>
          
          <TabsContent value="report">
            <MonthlyReport />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Seafood Wholesale Management System
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
