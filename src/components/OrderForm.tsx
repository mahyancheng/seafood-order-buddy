import React, { useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ChevronDown, Edit, X, User, Building, Phone, Mail, MapPin, Calendar as CalendarIconOutline } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { OrderConfirmationDialog } from "@/components/OrderConfirmationDialog";

const OrderForm: React.FC = () => {
  const { products, addProductToCart, removeProductFromCart, updateProductQuantity, cart, getCartTotal, submitOrder } = useOrder();
  
  // State for order items
  const [orderItems, setOrderItems] = useState<Array<{
    id: number;
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    notes: string;
  }>>([]);
  
  // State for client information
  const [clientInfo, setClientInfo] = useState({
    name: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: ""
  });
  
  // State for special instructions and delivery date
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date(Date.now() + 86400000)); // Tomorrow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomProduct, setShowCustomProduct] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: "",
    price: 0,
  });
  
  // State for editing item
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for editing client info
  const [isEditingClientInfo, setIsEditingClientInfo] = useState(false);
  
  // State for order confirmation dialog
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState<any>(null);
  
  // Effect to sync cart with orderItems
  useEffect(() => {
    if (cart.length === 0 && orderItems.length === 0) return;
    
    // If we have order items but cart is empty, sync to cart
    if (orderItems.length > 0 && cart.length === 0) {
      orderItems.forEach(item => {
        if (item.productId) {
          addProductToCart(item.productId, item.quantity, item.notes);
        }
      });
    }
    
    // If cart changes, update order items
    const updatedItems = cart.map((cartItem, index) => {
      const product = products.find(p => p.id === cartItem.productId);
      const existingItem = orderItems.find(item => item.productId === cartItem.productId);
      
      return {
        id: existingItem?.id || index + 1,
        productId: cartItem.productId,
        description: product?.name || "Custom Item",
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        total: cartItem.quantity * cartItem.unitPrice,
        notes: cartItem.notes || "",
      };
    });
    
    setOrderItems(updatedItems);
  }, [cart, products]);
  
  // Add a new blank row
  const handleSelectProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: product.id,
      description: product.name,
      unitPrice: product.price,
      total: updatedItems[index].quantity * product.price,
    };
    
    setOrderItems(updatedItems);
    
    // Sync with cart
    if (updatedItems[index].productId) {
      const item = updatedItems[index];
      addProductToCart(item.productId, item.quantity, item.notes);
    }
    
    // Close editing mode if open
    if (isEditing) {
      setIsEditing(false);
      setEditingItemIndex(null);
    }
  };
  
  // Handle adding a custom product
  const handleAddCustomProduct = (index: number) => {
    if (!customProduct.name || customProduct.price <= 0) {
      toast.error("Please enter a name and valid price for the custom product");
      return;
    }
    
    const customProductId = `custom-${Date.now()}`;
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: customProductId,
      description: customProduct.name,
      unitPrice: customProduct.price,
      total: updatedItems[index].quantity * customProduct.price,
    };
    
    setOrderItems(updatedItems);
    
    // Add to cart
    addProductToCart(customProductId, updatedItems[index].quantity, updatedItems[index].notes);
    
    // Reset custom product and close modal
    setCustomProduct({ name: "", price: 0 });
    setShowCustomProduct(false);
    
    toast.success("Custom product added");
    
    // Close editing mode if open
    if (isEditing) {
      setIsEditing(false);
      setEditingItemIndex(null);
    }
  };
  
  // Handle changing quantity
  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      total: quantity * updatedItems[index].unitPrice,
    };
    
    setOrderItems(updatedItems);
    
    // Sync with cart if product is selected
    if (updatedItems[index].productId) {
      updateProductQuantity(updatedItems[index].productId, quantity);
    }
  };
  
  // Handle removing a row
  const handleRemoveRow = (index: number) => {
    const item = orderItems[index];
    if (item.productId) {
      removeProductFromCart(item.productId);
    }
    
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
    
    // Close editing mode if this item was being edited
    if (editingItemIndex === index) {
      setIsEditing(false);
      setEditingItemIndex(null);
    }
  };
  
  // Handle client info changes
  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Start editing an item
  const startEditingItem = (index: number) => {
    setEditingItemIndex(index);
    setIsEditing(true);
  };
  
  // Close editing mode
  const cancelEditing = () => {
    setEditingItemIndex(null);
    setIsEditing(false);
  };
  
  // Add new row function
  const addNewRow = () => {
    setOrderItems([
      ...orderItems,
      {
        id: orderItems.length + 1,
        productId: "",
        description: "Click to select",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        notes: "",
      },
    ]);
  };
  
  // Handle submit order
  const handleSubmitOrder = () => {
    if (orderItems.length === 0 || !orderItems.some(item => item.productId)) {
      toast.error("Please add at least one product to the order");
      return;
    }
    
    if (!clientInfo.name || !clientInfo.contactPerson || !clientInfo.phone) {
      toast.error("Please fill in the required client information");
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare order data for confirmation dialog
    const orderData = {
      items: orderItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes
      })),
      specialInstructions,
      clientInfo,
      deliveryDate
    };
    
    // Simulate API call
    setTimeout(() => {
      submitOrder(clientInfo);
      
      // Show confirmation dialog
      setConfirmedOrderData(orderData);
      setShowOrderConfirmation(true);
      setIsSubmitting(false);
    }, 1000);
  };
  
  // Handle close confirmation dialog
  const handleCloseConfirmation = () => {
    setShowOrderConfirmation(false);
    
    // Reset form
    setOrderItems([]);
    setClientInfo({
      name: "",
      address: "",
      contactPerson: "",
      phone: "",
      email: "",
    });
    setSpecialInstructions("");
    
    toast.success("Order submitted successfully!");
  };

  return (
    <>
      <Card className="shadow-md">
        {/* Receipt Header */}
        <CardHeader className="p-4 bg-white">
          <div className="flex flex-col items-center">
            <div className="flex items-center w-full justify-center sm:justify-between mb-3">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/4fc43751-b8dd-4328-872a-45392c5523f0.png" 
                  alt="How Kee Logo" 
                  className="h-14 w-14 mr-3"
                />
                <div className="text-left hidden sm:block">
                  <h2 className="font-bold text-[#ea384c] text-xl">HOW KEE</h2>
                  <h3 className="font-bold text-[#ea384c]">FROZEN FOODS SDN BHD</h3>
                </div>
              </div>
              
              <div className="text-right hidden sm:block">
                <p className="text-sm">No. 41-C, Jalan Cerdas,</p>
                <p className="text-sm">Taman Connaught, Cheras,</p>
                <p className="text-sm">56000 Kuala Lumpur</p>
                <p className="text-sm">Tel: 03-9133 6172, 012-634 3172</p>
              </div>
            </div>
            
            {/* Mobile header details */}
            <div className="sm:hidden text-center w-full mb-2">
              <h2 className="font-bold text-[#ea384c] text-xl">HOW KEE FROZEN FOODS SDN BHD</h2>
              <p className="text-xs">No. 41-C, Jalan Cerdas, Taman Connaught, Cheras, 56000 KL</p>
              <p className="text-xs">Tel: 03-9133 6172, 012-634 3172</p>
            </div>
            
            <div className="w-full border-b-2 border-[#ea384c] my-2"></div>
            <h3 className="font-bold text-xl w-full text-center">SALES ORDER</h3>
          </div>
          
          {/* Client Information - Updated to be similar to the order table */}
          <div className="mt-4 border rounded-md overflow-hidden">
            <div className="bg-gray-100 p-3 flex justify-between items-center">
              <h3 className="font-medium text-sm">Client Information</h3>
              <Button 
                onClick={() => setIsEditingClientInfo(!isEditingClientInfo)} 
                variant="outline" 
                size="sm" 
                className="h-8"
              >
                {isEditingClientInfo ? (
                  <>
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </>
                )}
              </Button>
            </div>
            
            {isEditingClientInfo ? (
              <div className="divide-y">
                <div className="grid grid-cols-12 gap-2 p-3 items-center">
                  <div className="col-span-12 sm:col-span-3 flex items-center text-sm font-medium">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    Client Name <span className="text-red-500 ml-1">*</span>
                  </div>
                  <div className="col-span-12 sm:col-span-9">
                    <Input
                      name="name"
                      value={clientInfo.name}
                      onChange={handleClientInfoChange}
                      placeholder="Company or client name"
                      required
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 items-center">
                  <div className="col-span-12 sm:col-span-3 flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    Address
                  </div>
                  <div className="col-span-12 sm:col-span-9">
                    <Textarea
                      name="address"
                      value={clientInfo.address}
                      onChange={handleClientInfoChange}
                      placeholder="Delivery address"
                      className="resize-none h-16"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 items-center">
                  <div className="col-span-12 sm:col-span-3 flex items-center text-sm font-medium">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Contact Person <span className="text-red-500 ml-1">*</span>
                  </div>
                  <div className="col-span-12 sm:col-span-9">
                    <Input
                      name="contactPerson"
                      value={clientInfo.contactPerson}
                      onChange={handleClientInfoChange}
                      placeholder="Contact person name"
                      required
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 items-center">
                  <div className="col-span-12 sm:col-span-3 flex items-center text-sm font-medium">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    Phone <span className="text-red-500 ml-1">*</span>
                  </div>
                  <div className="col-span-12 sm:col-span-9">
                    <Input
                      name="phone"
                      value={clientInfo.phone}
                      onChange={handleClientInfoChange}
                      placeholder="Contact phone number"
                      required
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 items-center">
                  <div className="col-span-12 sm:col-span-3 flex items-center text-sm font-medium">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    Email
                  </div>
                  <div className="col-span-12 sm:col-span-9">
                    <Input
                      name="email"
                      type="email"
                      value={clientInfo.email}
                      onChange={handleClientInfoChange}
                      placeholder="Contact email"
                      className="h-9"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 items-center">
                  <div className="col-span-12 sm:col-span-3 flex items-center text-sm font-medium">
                    <CalendarIconOutline className="h-4 w-4 mr-2 text-muted-foreground" />
                    Delivery Date
                  </div>
                  <div className="col-span-12 sm:col-span-9">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !deliveryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deliveryDate}
                          onSelect={setDeliveryDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                <div className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50">
                  <div className="col-span-4 sm:col-span-3 flex items-center text-sm font-medium">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    Client
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-sm">
                    {clientInfo.name || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50">
                  <div className="col-span-4 sm:col-span-3 flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    Address
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-sm">
                    {clientInfo.address ? (
                      <span className="whitespace-pre-line">{clientInfo.address}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50">
                  <div className="col-span-4 sm:col-span-3 flex items-center text-sm font-medium">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Contact
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-sm">
                    {clientInfo.contactPerson || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50">
                  <div className="col-span-4 sm:col-span-3 flex items-center text-sm font-medium">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    Phone
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-sm">
                    {clientInfo.phone || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50">
                  <div className="col-span-4 sm:col-span-3 flex items-center text-sm font-medium">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    Email
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-sm">
                    {clientInfo.email || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 p-3 hover:bg-gray-50">
                  <div className="col-span-4 sm:col-span-3 flex items-center text-sm font-medium">
                    <CalendarIconOutline className="h-4 w-4 mr-2 text-muted-foreground" />
                    Delivery
                  </div>
                  <div className="col-span-8 sm:col-span-9 text-sm">
                    {deliveryDate ? format(deliveryDate, "PPP") : <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="p-3 sm:p-6">
          {/* Order Items Table - Optimized for both mobile and desktop */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm">Order Items</h3>
              <Button 
                onClick={addNewRow}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>
            
            {/* Responsive Table Design */}
            <div className="border rounded-md overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-100 grid grid-cols-12 gap-1 p-2 text-xs font-medium border-b text-gray-700">
                <div className="col-span-1 flex items-center justify-center">#</div>
                <div className="col-span-4 sm:col-span-5">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center hidden sm:block">Unit</div>
                <div className="col-span-2 sm:col-span-1 text-center">Price</div>
                <div className="col-span-3 sm:col-span-1 flex justify-end">Actions</div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y">
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <div key={item.id} className={`grid grid-cols-12 gap-1 p-2 items-center text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="col-span-4 sm:col-span-5 flex items-center">
                        {editingItemIndex === index ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between text-sm h-8">
                                <span className="truncate">{item.description}</span>
                                <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              {products.map(product => (
                                <DropdownMenuItem 
                                  key={product.id} 
                                  onClick={() => handleSelectProduct(index, product.id)}
                                  className="text-sm"
                                >
                                  {product.name} - ${product.price.toFixed(2)}/{product.unit}
                                </DropdownMenuItem>
                              ))}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Other / Custom Item
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[95vw] max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Add Custom Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Enter the details for your custom item.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="grid gap-4 py-2">
                                    <div className="grid items-center gap-2">
                                      <label htmlFor="customName" className="text-sm font-medium">
                                        Name
                                      </label>
                                      <Input
                                        id="customName"
                                        value={customProduct.name}
                                        onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                                      />
                                    </div>
                                    <div className="grid items-center gap-2">
                                      <label htmlFor="customPrice" className="text-sm font-medium">
                                        Price
                                      </label>
                                      <Input
                                        id="customPrice"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={customProduct.price}
                                        onChange={(e) => setCustomProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                      />
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleAddCustomProduct(index)}>
                                      Add Item
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenu>
                          ) : (
                            <div className="w-full truncate" title={item.description}>
                              {item.description}
                              {item.notes && (
                                <div className="text-xs text-muted-foreground truncate mt-1" title={item.notes}>
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-2 text-center">
                          {editingItemIndex === index ? (
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                              className="w-full h-8 text-sm p-1 text-center"
                            />
                          ) : (
                            <div>{item.quantity}</div>
                          )}
                        </div>
                        
                        <div className="col-span-2 text-center hidden sm:block">
                          {editingItemIndex === index ? (
                            <div className="text-center">{products.find(p => p.id === item.productId)?.unit || 'unit'}</div>
                          ) : (
                            <div>{products.find(p => p.id === item.productId)?.unit || 'unit'}</div>
                          )}
                        </div>
                        
                        <div className="col-span-2 sm:col-span-1 text-center font-medium">
                          ${item.unitPrice.toFixed(2)}
                        </div>
                        
                        <div className="col-span-3 sm:col-span-1 flex justify-end gap-1">
                          {editingItemIndex === index ? (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={cancelEditing}>
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEditingItem(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => handleRemoveRow(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Notes input when editing */}
                        {editingItemIndex === index && (
                          <div className="col-span-12 mt-2">
                            <Label htmlFor={`note-${index}`} className="text-xs mb-1 block">
                              Notes
                            </Label>
                            <Input
                              id={`note-${index}`}
                              placeholder="Add notes (optional)"
                              value={item.notes}
                              onChange={(e) => {
                                const updatedItems = [...orderItems];
                                updatedItems[index].notes = e.target.value;
                                setOrderItems(updatedItems);
                                
                                // Update notes in cart
                                if (item.productId) {
                                  const currentItem = cart.find(cartItem => cartItem.productId === item.productId);
                                  if (currentItem) {
                                    addProductToCart(item.productId, currentItem.quantity, e.target.value);
                                  }
                                }
                              }}
                              className="text-xs h-7"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No items added yet. Click "Add Item" to begin your order.
                    </div>
                  )}
                </div>
                
                {/* Table Footer - Total */}
                {orderItems.length > 0 && (
                  <div className="bg-gray-100 p-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order Total:</span>
                      <span className="text-lg font-bold">${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Special Instructions */}
            <div className="mt-4">
              <label htmlFor="specialInstructions" className="text-sm font-medium block mb-2">
                Special Instructions
              </label>
              <Textarea
                id="specialInstructions"
                placeholder="Add any special instructions for this order..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="resize-none h-20"
              />
            </div>
            
            {/* Submit Button */}
            <div className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={isSubmitting || orderItems.length === 0}>
                    {isSubmitting ? "Submitting..." : "Submit Order"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[95vw] max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Order Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit this order?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmitOrder}>
                      Submit Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Confirmation Dialog */}
        {confirmedOrderData && (
          <OrderConfirmationDialog
            open={showOrderConfirmation}
            onClose={handleCloseConfirmation}
            orderData={confirmedOrderData}
          />
        )}
      </>
    );
  };

  export default OrderForm;
