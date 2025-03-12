
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ProductManagement from "./ProductManagement";
import DownloadCenter from "./DownloadCenter";
import UserManagement from "./UserManagement";
import { 
  BarChart, PieChart, TrendingUp, List, 
  Bell, CheckCircle, Clock, XCircle, 
  LogOut, UserRound, Package, Settings, 
  Users, ShoppingBag, Truck, FileText, 
  Search, Filter, AlertTriangle, BarChart2,
  ArrowUpRight, Layers, Calendar, Download,
  Menu, X
} from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from "react-i18next";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { orders, products } = useOrder();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { t, i18n } = useTranslation("global");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count orders by status
  const orderCounts = {
    submitted: orders.filter(order => order.status === "submitted").length,
    processing: orders.filter(order => order.status === "processing").length,
    completed: orders.filter(order => order.status === "completed").length,
    cancelled: orders.filter(order => order.status === "cancelled").length,
    total: orders.length
  };

  // Calculate total revenue
  const totalRevenue = orders
    .filter(order => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  
  // Calculate total sales volume (quantity)
  const totalSalesVolume = orders
    .filter(order => order.status !== "cancelled")
    .flatMap(order => order.items)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Calculate top products
  const productSales = products.map(product => {
    const salesQuantity = orders
      .filter(order => order.status !== "cancelled")
      .flatMap(order => order.items.filter(item => item.productId === product.id))
      .reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      name: product.name,
      quantity: salesQuantity,
      value: salesQuantity
    };
  }).sort((a, b) => b.quantity - a.quantity);

  // Chart data for monthly sales
  const monthlyData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 8000 },
    { name: 'May', sales: 7000 },
    { name: 'Jun', sales: 9000 },
  ];

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === "" || 
      (order.clientInfo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       order.id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-500";
      case "processing": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted": return <Bell className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const ActivityTimeline = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge className="bg-blue-500 text-white p-1"><Bell className="h-3 w-3" /></Badge>
        <div className="flex-1">
          <p className="text-sm font-medium">{t("adminDashboard.new_order")}</p>
          <p className="text-xs text-muted-foreground">{t("adminDashboard.30_minit_ago")}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-green-500 text-white p-1"><CheckCircle className="h-3 w-3" /></Badge>
        <div className="flex-1">
          <p className="text-sm font-medium">{t("adminDashboard.order_completed", { orderNumber: "2468" })}</p>
          <p className="text-xs text-muted-foreground">2 hours ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-yellow-500 text-white p-1"><Truck className="h-3 w-3" /></Badge>
        <div className="flex-1">
          <p className="text-sm font-medium">{t("adminDashboard.order_dispatched", { orderNumber: "2467" })}</p>
          <p className="text-xs text-muted-foreground">5 hours ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-purple-500 text-white p-1"><UserRound className="h-3 w-3" /></Badge>
        <div className="flex-1">
          <p className="text-sm font-medium">{t("adminDashboard.new_client")}</p>
          <p className="text-xs text-muted-foreground">Yesterday</p>
        </div>
      </div>
    </div>
  );

  // Mobile navigation menu
  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-xl p-4 transition-transform duration-300 ease-in-out transform" 
        style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/4fc43751-b8dd-4328-872a-45392c5523f0.png" 
              alt="Logo" 
              className="h-10 w-10 mr-2"
            />
            <span className="font-bold text-lg text-primary">{t("adminDashboard.app_name")}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-1 mb-6">
        {[
          { id: "overview", label: t("adminDashboard.overview"), icon: <BarChart2 className="h-4 w-4" /> },
          { id: "orders", label: t("adminDashboard.orders"), icon: <ShoppingBag className="h-4 w-4" /> },
          { id: "products", label: t("adminDashboard.products"), icon: <Package className="h-4 w-4" /> },
          { id: "users", label: t("adminDashboard.users"), icon: <Users className="h-4 w-4" /> },
          { id: "clients", label: t("adminDashboard.clients"), icon: <UserRound className="h-4 w-4" /> },
          { id: "inventory", label: t("adminDashboard.inventory"), icon: <Layers className="h-4 w-4" /> },
          { id: "downloads", label: t("adminDashboard.downloads"), icon: <Download className="h-4 w-4" /> },
          { id: "settings", label: t("adminDashboard.settings"), icon: <Settings className="h-4 w-4" /> }
        ].map(tab => (
            <button
              key={tab.id}
              className={`flex items-center w-full px-4 py-2 text-sm rounded-md 
                ${activeTab === tab.id ? 'bg-primary text-white' : 'hover:bg-secondary'}`}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="mr-3">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("adminDashboard.log_out")}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Mobile Menu */}
      <MobileMenu />
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="bg-primary/10 p-2 rounded-md">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-medium">{t("adminDashboard.seafood_orders")}</h1>
            <div className="hidden md:flex gap-2 items-center ml-4 text-sm">
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground font-medium">{t("adminDashboard.app_name")}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={() => i18n.changeLanguage("en")} variant="outline" size="sm">🇬🇧 EN</Button>
            <Button onClick={() => i18n.changeLanguage("cn")} variant="outline" size="sm">🇨🇳 中文</Button>
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium hidden sm:inline">{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop TabsList */}
          <TabsList className="hidden md:grid grid-cols-8 w-full max-w-6xl mx-auto bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>{t("adminDashboard.overview")}</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>{t("adminDashboard.orders")}</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{t("adminDashboard.products")}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t("adminDashboard.users")}</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              <span>{t("adminDashboard.clients")}</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>{t("adminDashboard.inventory")}</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>{t("adminDashboard.downloads")}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>{t("adminDashboard.settings")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Mobile Tab indicator */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              {activeTab === "overview" && <BarChart2 className="h-5 w-5" />}
              {activeTab === "orders" && <ShoppingBag className="h-5 w-5" />}
              {activeTab === "products" && <Package className="h-5 w-5" />}
              {activeTab === "users" && <Users className="h-5 w-5" />}
              {activeTab === "clients" && <UserRound className="h-5 w-5" />}
              {activeTab === "inventory" && <Layers className="h-5 w-5" />}
              {activeTab === "downloads" && <Download className="h-5 w-5" />}
              {activeTab === "settings" && <Settings className="h-5 w-5" />}
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {t("adminDashboard.total_orders")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-3xl font-bold text-blue-800">{orderCounts.total}</div>
                  <div className="flex items-center text-xs text-blue-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>12% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-green-700 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t("adminDashboard.revenue")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-3xl font-bold text-green-800">${totalRevenue.toFixed(2)}</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>8% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {t("adminDashboard.active_clients")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-3xl font-bold text-purple-800">18</div>
                  <div className="flex items-center text-xs text-purple-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>5% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-amber-700 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t("adminDashboard.pending_orders")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-3xl font-bold text-amber-800">{orderCounts.submitted}</div>
                  <div className="flex items-center text-xs text-amber-600 mt-1">
                    <span>{t("adminDashboard.needs_attention")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">{t("adminDashboard.monthly_sales")}</CardTitle>
                  <CardDescription>{t("adminDashboard.revenue_trends")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={monthlyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#3B82F6" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("adminDashboard.recent_activity")}</CardTitle>
                  <CardDescription>{t("adminDashboard.latest_updates")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">{t("adminDashboard.view_all_activity")}</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                <CardTitle className="text-lg">{t("adminDashboard.top_products")}</CardTitle>
                <CardDescription>{t("adminDashboard.best_selling")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-4">
                      {productSales.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center">
                          <div className="bg-primary/10 p-2 rounded-md mr-3">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.quantity} {t("adminDashboard.unit_sold")}</div>
                          </div>
                          <div className="ml-auto text-sm font-medium">
                            {Math.round((product.quantity / totalSalesVolume) * 100)}%
                          </div>
                          <div className="w-16 md:w-24 h-2 bg-secondary ml-2 md:ml-4 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.round((product.quantity / totalSalesVolume) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("adminDashboard.recent_orders")}</CardTitle>
                  <CardDescription>
                  {t("adminDashboard.latest_orders")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="bg-secondary/30 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{order.clientInfo?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-white flex items-center gap-1`}>
                              {getStatusIcon(order.status)}
                              {t(`order.status.${order.status.toLowerCase()}`)}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>{t("adminDashboard.items")}:</span>
                              <span>{order.items.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("adminDashboard.total")}:</span>
                              <span className="font-medium">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("orders")}>
                  {t("adminDashboard.view_all_orders")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                  <CardTitle>{t("adminDashboard.order_management")}</CardTitle>
                  <CardDescription>{t("adminDashboard.manage_orders")}</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder={t("adminDashboard.search_orders")}
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select 
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">{t("adminDashboard.all_status")}</option>
                      <option value="submitted">{t("adminDashboard.submitted")}</option>
                      <option value="processing">{t("adminDashboard.processing")}</option>
                      <option value="completed">{t("adminDashboard.completed")}</option>
                      <option value="cancelled">{t("adminDashboard.cancelled")}</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== "all" 
                      ? "No orders found matching your search criteria"
                      : "No orders have been placed yet"}
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="border p-4 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-lg">{order.clientInfo?.name}</div>
                              <div className="text-sm text-muted-foreground">
                              {t("adminDashboard.order_id")}: {order.id.slice(0, 8)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                              {t("adminDashboard.created")}: {new Date(order.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-white flex items-center gap-1`}>
                              {getStatusIcon(order.status)}
                              {t(`order.status.${order.status.toLowerCase()}`)}
                            </Badge>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">{t("adminDashboard.order_details")}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">{t("adminDashboard.contact")}:</span>
                                <div>{order.clientInfo?.contactPerson}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("adminDashboard.phone")}:</span>
                                <div>{order.clientInfo?.phone}</div>
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                <span className="text-muted-foreground">{t("adminDashboard.delivery_address")}:</span>
                                <div>{order.clientInfo?.address}</div>
                              </div>
                            </div>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">{t("adminDashboard.items")}:</h4>
                            <ScrollArea className="h-[150px]">
                              <div className="space-y-2">
                                {order.items.map((item) => {
                                  const product = products.find(p => p.id === item.productId);
                                  if (!product) return null;
                                  
                                  return (
                                    <div key={item.productId} className="flex justify-between text-sm">
                                      <div className="flex gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                          {product.name} ({item.quantity} {product.unit})
                                        </span>
                                      </div>
                                      <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div className="flex justify-between font-medium">
                            <span>{t("adminDashboard.total")}:</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                          
                          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              {t("adminDashboard.view_details")}
                            </Button>
                            <Button size="sm" className="w-full sm:w-auto">
                              {t("adminDashboard.update_status")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6 animate-fade-in">
            <ProductManagement />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6 animate-fade-in">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
              <CardTitle>{t("adminDashboard.client_management")}</CardTitle>
              <CardDescription>{t("adminDashboard.view_manage_clients")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                {t("adminDashboard.coming_soon_clients")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
              <CardTitle>{t("adminDashboard.inventory_management")}</CardTitle>
              <CardDescription>{t("adminDashboard.view_manage_inventory")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                {t("adminDashboard.coming_soon_inventory")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-6 animate-fade-in">
            <DownloadCenter />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminDashboard.settings")}</CardTitle>
                <CardDescription>{t("adminDashboard.view_manage_settings")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  {t("adminDashboard.coming_soon_settings")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 bg-white/80 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()}  {t("adminDashboard.footer_text")}
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
