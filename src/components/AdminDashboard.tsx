import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BarChart, List, Bell, CheckCircle, Clock, XCircle, LogOut, UserRound, Package, Settings } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { orders, products } = useOrder(); // Import products from OrderContext
  const [activeTab, setActiveTab] = useState("overview");

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

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium">Seafood Orders</h1>
            <div className="hidden md:flex gap-2 items-center ml-4 text-sm">
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Admin Dashboard</span>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderCounts.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time orders</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderCounts.submitted}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderCounts.processing}</div>
                  <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest 5 orders in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders have been placed yet
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>
                  View and manage all orders in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders have been placed yet
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border p-4 rounded-lg">
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
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
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
