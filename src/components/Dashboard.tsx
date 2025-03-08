
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import OrderForm from "./OrderForm";
import OrderHistory from "./OrderHistory";
import MonthlyReport from "./MonthlyReport";
import DownloadCenter from "./DownloadCenter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LogOut, 
  UserRound, 
  FileText, 
  Package, 
  ShoppingBag, 
  BarChart2, 
  History,
  Download
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("newOrder");
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/4fc43751-b8dd-4328-872a-45392c5523f0.png" 
              alt="How Kee Frozen Foods Logo" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-medium text-[#ea384c]">How Kee Frozen Foods</h1>
              <p className="text-xs text-muted-foreground">Sdn Bhd</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
              <Avatar className="h-6 w-6 bg-[#ea384c]/10">
                <AvatarFallback className="text-[#ea384c]">{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user?.name}</span>
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
          <TabsList className="grid grid-cols-4 mb-6 bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="newOrder" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>New Order</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Order History</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Monthly Report</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Downloads</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="newOrder" className="animate-fade-in">
            <OrderForm />
          </TabsContent>
          
          <TabsContent value="history" className="animate-fade-in">
            <OrderHistory />
          </TabsContent>
          
          <TabsContent value="report" className="animate-fade-in">
            <MonthlyReport />
          </TabsContent>
          
          <TabsContent value="downloads" className="animate-fade-in">
            <DownloadCenter />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 bg-white/80 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} How Kee Frozen Foods Sdn Bhd - Seafood Wholesale Management System
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
