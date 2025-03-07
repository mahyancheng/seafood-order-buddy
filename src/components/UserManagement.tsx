
import React, { useState } from "react";
import { useAuth, UserWithCredentials } from "@/context/AuthContext";
import { 
  Card, CardHeader, CardTitle, 
  CardDescription, CardContent, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  UserPlus, UserMinus, Edit, Eye, EyeOff, 
  UserCog, ShieldCheck, Shield, Search 
} from "lucide-react";
import { useOrder } from "@/context/OrderContext";

const UserManagement: React.FC = () => {
  const { allUsers, addUser, removeUser, updateUser, user: currentUser } = useAuth();
  const { orders } = useOrder();
  
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showUserStatsDialog, setShowUserStatsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithCredentials | null>(null);
  const [viewingUser, setViewingUser] = useState<UserWithCredentials | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"salesperson" | "admin">("salesperson");
  
  // Edit user form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"salesperson" | "admin">("salesperson");
  
  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // Filter users based on search query
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Reset add user form
  const resetAddUserForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("salesperson");
    setShowPassword(false);
  };
  
  // Handle add user
  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toast.error("All fields are required");
      return;
    }
    
    addUser(newUserName, newUserEmail, newUserPassword, newUserRole);
    resetAddUserForm();
    setShowAddUserDialog(false);
  };
  
  // Open edit user dialog
  const openEditUserDialog = (user: UserWithCredentials) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");  // Don't show current password
    setEditRole(user.role);
    setShowEditUserDialog(true);
  };
  
  // Handle edit user
  const handleEditUser = () => {
    if (!editingUser) return;
    
    const updates: Partial<Omit<UserWithCredentials, "id">> = {};
    
    if (editName.trim() && editName !== editingUser.name) {
      updates.name = editName;
    }
    
    if (editEmail.trim() && editEmail !== editingUser.email) {
      updates.email = editEmail;
    }
    
    if (editPassword.trim()) {
      updates.password = editPassword;
    }
    
    if (editRole !== editingUser.role) {
      updates.role = editRole;
    }
    
    if (Object.keys(updates).length === 0) {
      toast.info("No changes were made");
      setShowEditUserDialog(false);
      return;
    }
    
    updateUser(editingUser.id, updates);
    setShowEditUserDialog(false);
  };
  
  // Open user stats dialog
  const openUserStatsDialog = (user: UserWithCredentials) => {
    setViewingUser(user);
    setShowUserStatsDialog(true);
  };
  
  // Get user orders
  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.userId === userId);
  };
  
  // Calculate user statistics
  const calculateUserStats = (userId: string) => {
    const userOrders = getUserOrders(userId);
    
    return {
      totalOrders: userOrders.length,
      completedOrders: userOrders.filter(order => order.status === "completed").length,
      processingOrders: userOrders.filter(order => order.status === "processing").length,
      submittedOrders: userOrders.filter(order => order.status === "submitted").length,
      cancelledOrders: userOrders.filter(order => order.status === "cancelled").length,
      totalRevenue: userOrders
        .filter(order => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.total, 0)
    };
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Add, edit, and remove user accounts
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search users..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Enter user's full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="Enter user's email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Enter user's password"
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "salesperson" | "admin")}
                    >
                      <option value="salesperson">Salesperson</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      resetAddUserForm();
                      setShowAddUserDialog(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No users matching your search" : "No users found"}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const isCurrentUser = currentUser?.id === user.id;
                const userStats = calculateUserStats(user.id);
                
                return (
                  <div 
                    key={user.id} 
                    className={`border p-4 rounded-lg transition-colors ${
                      isCurrentUser ? "border-primary/50 bg-primary/5" : "hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-full">
                          {user.role === "admin" ? (
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <UserCog className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-lg flex items-center gap-2">
                            {user.name}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs ml-2">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${user.role === "admin" ? "bg-purple-500" : "bg-blue-500"} text-white flex items-center gap-1`}>
                        {user.role === "admin" ? (
                          <>
                            <ShieldCheck className="h-3 w-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserCog className="h-3 w-3" />
                            Salesperson
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="rounded-lg bg-secondary/30 p-2 text-center">
                        <div className="text-sm text-muted-foreground">Orders</div>
                        <div className="font-medium">{userStats.totalOrders}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/30 p-2 text-center">
                        <div className="text-sm text-muted-foreground">Completed</div>
                        <div className="font-medium">{userStats.completedOrders}</div>
                      </div>
                      <div className="rounded-lg bg-secondary/30 p-2 text-center">
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="font-medium">${userStats.totalRevenue.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openUserStatsDialog(user)}
                      >
                        View Stats
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditUserDialog(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      {!isCurrentUser && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeUser(user.id)}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">
                  Password <span className="text-muted-foreground text-xs">(Leave blank to keep current)</span>
                </Label>
                <div className="relative">
                  <Input 
                    id="edit-password" 
                    type={showPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    type="button"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "salesperson" | "admin")}
                >
                  <option value="salesperson">Salesperson</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditUserDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Stats Dialog */}
      <Dialog open={showUserStatsDialog} onOpenChange={setShowUserStatsDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {viewingUser?.name}'s Performance Statistics
            </DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center border border-blue-100">
                  <div className="text-sm text-blue-600">Total Orders</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {calculateUserStats(viewingUser.id).totalOrders}
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center border border-green-100">
                  <div className="text-sm text-green-600">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-700">
                    ${calculateUserStats(viewingUser.id).totalRevenue.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Order Status Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 text-center border border-blue-100">
                    <div className="text-xs text-blue-600">Submitted</div>
                    <div className="font-bold text-blue-700">
                      {calculateUserStats(viewingUser.id).submittedOrders}
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-2 text-center border border-yellow-100">
                    <div className="text-xs text-yellow-600">Processing</div>
                    <div className="font-bold text-yellow-700">
                      {calculateUserStats(viewingUser.id).processingOrders}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-2 text-center border border-green-100">
                    <div className="text-xs text-green-600">Completed</div>
                    <div className="font-bold text-green-700">
                      {calculateUserStats(viewingUser.id).completedOrders}
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2 text-center border border-red-100">
                    <div className="text-xs text-red-600">Cancelled</div>
                    <div className="font-bold text-red-700">
                      {calculateUserStats(viewingUser.id).cancelledOrders}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="font-medium">Recent Orders</h3>
                <ScrollArea className="h-[200px]">
                  {getUserOrders(viewingUser.id).length > 0 ? (
                    <div className="space-y-2">
                      {getUserOrders(viewingUser.id)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map(order => (
                          <div key={order.id} className="p-2 rounded-lg bg-secondary/30">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={`
                                  ${order.status === "completed" ? "bg-green-500" : 
                                    order.status === "processing" ? "bg-yellow-500" : 
                                    order.status === "submitted" ? "bg-blue-500" : "bg-red-500"} 
                                  text-white
                                `}>
                                  {order.status}
                                </Badge>
                                <div className="text-sm font-medium mt-1">
                                  ${order.total.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found for this user
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserStatsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
