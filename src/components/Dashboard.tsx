
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { useTranslation } from "react-i18next";
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
  Download,
  Menu
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation("global");
  const [activeTab, setActiveTab] = useState("newOrder");
  
  return (
    <div className="min-h-screen flex flex-col animate-fade-in bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/4fc43751-b8dd-4328-872a-45392c5523f0.png" 
              alt="How Kee Frozen Foods Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-medium text-[#ea384c]">{t("dashboard.app_name")}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{t("dashboard.company_suffix")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => i18n.changeLanguage("en")} variant="outline" size="sm">🇬🇧 EN</Button>
            <Button onClick={() => i18n.changeLanguage("cn")} variant="outline" size="sm">🇨🇳 中文</Button>

            <div className="flex items-center gap-2 bg-secondary px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 bg-[#ea384c]/10">
                <AvatarFallback className="text-[#ea384c] text-xs">{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium hidden sm:inline">{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 sm:h-9 sm:w-9">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-2 py-3 sm:px-4 sm:py-6">
        {/* Mobile View: Sheet for navigation */}
        <div className="block sm:hidden mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {activeTab === "newOrder" && "New Order"}
              {activeTab === "history" && "Order History"}
              {activeTab === "report" && "Monthly Report"}
              {activeTab === "downloads" && "Downloads"}
            </h2>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] max-w-xs">
                <SheetHeader className="mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/lovable-uploads/4fc43751-b8dd-4328-872a-45392c5523f0.png" 
                      alt="How Kee Logo" 
                      className="h-10 w-10"
                    />
                    <div>
                      <SheetTitle className="text-[#ea384c]">{t("app_name")}</SheetTitle>
                      <SheetDescription>
                      {t("dashboard.seafood_management")}
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                <div className="py-2 flex flex-col gap-1">
                  <SheetClose asChild>
                    <Button 
                      variant={activeTab === "newOrder" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("newOrder")}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {t("dashboard.new_order")}
                    </Button>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Button 
                      variant={activeTab === "history" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("history")}
                    >
                      <History className="h-4 w-4 mr-2" />
                      {t("dashboard.order_history")}
                    </Button>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Button 
                      variant={activeTab === "report" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("report")}
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      {t("dashboard.monthly_report")}
                    </Button>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Button 
                      variant={activeTab === "downloads" ? "default" : "ghost"} 
                      className="justify-start"
                      onClick={() => setActiveTab("downloads")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("dashboard.downloads")}
                    </Button>
                  </SheetClose>
                </div>
                
                <div className="mt-auto pt-4 border-t flex items-center">
                  <Avatar className="h-9 w-9 mr-2">
                    <AvatarFallback className="bg-[#ea384c]/10 text-[#ea384c]">
                      {user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Desktop View: Tabs */}
        <div className="hidden sm:block">
          <Tabs defaultValue="newOrder" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-secondary/50 p-1 rounded-lg">
              <TabsTrigger value="newOrder" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>{t("dashboard.new_order")}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>{t("dashboard.order_history")}</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>{t("dashboard.monthly_report")}</span>
              </TabsTrigger>
              <TabsTrigger value="downloads" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{t("dashboard.downloads")}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Content based on active tab */}
        <div className="animate-fade-in">
          {activeTab === "newOrder" && <OrderForm />}
          {activeTab === "history" && <OrderHistory />}
          {activeTab === "report" && <MonthlyReport />}
          {activeTab === "downloads" && <DownloadCenter />}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-3 bg-white mt-auto text-center">
        <div className="container mx-auto px-4 text-xs sm:text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t("dashboard.app_name")} - {t("dashboard.seafood_management")}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
