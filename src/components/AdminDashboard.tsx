
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
import { 
  BarChart, PieChart, TrendingUp, List, 
  Bell, CheckCircle, Clock, XCircle, 
  LogOut, UserRound, Package, Settings, 
  Users, ShoppingBag, Truck, FileText, 
  Search, Filter, AlertTriangle, BarChart2,
  ArrowUpRight, Layers, Calendar
} from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { orders, products } = useOrder();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
          <p className="text-sm font-medium">New order received</p>
          <p className="text-xs text-muted-foreground">30 minutes ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-green-500 text-white p-1"><CheckCircle className="h-3 w-3" /></Badge>
        <div className="flex-1">
          <p className="text-sm font-medium">Order #2468 completed</p>
          <p className="text-xs text-muted-foreground">2 hours ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-yellow-500 text-white p-1"><Truck className="h-3 w-3" /></Badge>
        <div className="flex-1">
          <p className="text-sm font-medium">Order #2467 dispatched</p>
          <p className="text-xs text-muted-foreground">5 hours ago</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-purple-500 text-white p-1"><UserRound className="h-3 w-3" /></Badge>
        <div className="flex-1">
          <p className="text-sm font-medium">New client registered</p>
          <p className="text-xs text-muted-foreground">Yesterday</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-md">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-medium">Seafood Orders</h1>
            <div className="hidden md:flex gap-2 items-center ml-4 text-sm">
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground font-medium">Admin Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Clients</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">{orderCounts.total}</div>
                  <div className="flex items-center text-xs text-blue-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>12% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800">${totalRevenue.toFixed(2)}</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>8% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Active Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-800">18</div>
                  <div className="flex items-center text-xs text-purple-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>5% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-700 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pending Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-800">{orderCounts.submitted}</div>
                  <div className="flex items-center text-xs text-amber-600 mt-1">
                    <span>Needs attention</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Sales</CardTitle>
                  <CardDescription>
                    Revenue trends for the past 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">View All Activity</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Products</CardTitle>
                  <CardDescription>
                    Best selling seafood items
                  </CardDescription>
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
                            <div className="text-sm text-muted-foreground">{product.quantity} units sold</div>
                          </div>
                          <div className="ml-auto text-sm font-medium">
                            {Math.round((product.quantity / totalSalesVolume) * 100)}%
                          </div>
                          <div className="w-24 h-2 bg-secondary ml-4 rounded-full overflow-hidden">
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
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <CardDescription>
                    Latest 5 orders in the system
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
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Items:</span>
                              <span>{order.items.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total:</span>
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
                    View All Orders
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
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>
                      View and manage all orders in the system
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder="Search orders..." 
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
                      <option value="all">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
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
                                Order ID: {order.id.slice(0, 8)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Created: {new Date(order.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-white flex items-center gap-1`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Order Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Contact:</span>
                                <div>{order.clientInfo?.contactPerson}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Phone:</span>
                                <div>{order.clientInfo?.phone}</div>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Delivery Address:</span>
                                <div>{order.clientInfo?.address}</div>
                              </div>
                            </div>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Items</h4>
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
                            <span>Total:</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                          
                          <div className="mt-4 flex gap-2 justify-end">
                            <Button variant="outline" size="sm">View Details</Button>
                            <Button size="sm">Update Status</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  View and manage client accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Client management features will be implemented in future updates
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Monitor and manage product inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Inventory management features will be implemented in future updates
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  Manage system configuration and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Settings functionality will be implemented in future updates
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 bg-white/80 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Seafood Wholesale Management System
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
