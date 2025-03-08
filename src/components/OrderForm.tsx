
import React, { useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  
  // Handle selecting a product
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
  };
  
  // Handle client info changes
  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
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
    
    // Simulate API call
    setTimeout(() => {
      submitOrder(clientInfo);
      
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
      setIsSubmitting(false);
      
      toast.success("Order submitted successfully!");
    }, 1000);
  };

  return (
    <Card className="shadow-md">
      {/* Receipt Header */}
      <CardHeader className="p-6 bg-white">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/0eec3a42-3ec3-47c8-a425-5f779b95d54f.png" 
            alt="How Kee Frozen Foods Header" 
            className="w-full max-w-2xl mb-4"
          />
        </div>
        
        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border p-4 rounded-md bg-gray-50">
          <div className="space-y-3">
            <div>
              <label htmlFor="clientName" className="text-sm font-medium block mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="clientName"
                name="name"
                value={clientInfo.name}
                onChange={handleClientInfoChange}
                placeholder="Company or client name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="address" className="text-sm font-medium block mb-1">
                Address
              </label>
              <Textarea
                id="address"
                name="address"
                value={clientInfo.address}
                onChange={(e) => setClientInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Delivery address"
                className="resize-none h-20"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="contactPerson" className="text-sm font-medium block mb-1">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={clientInfo.contactPerson}
                onChange={handleClientInfoChange}
                placeholder="Contact person name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="text-sm font-medium block mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                name="phone"
                value={clientInfo.phone}
                onChange={handleClientInfoChange}
                placeholder="Contact phone number"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="text-sm font-medium block mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={clientInfo.email}
                onChange={handleClientInfoChange}
                placeholder="Contact email"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="deliveryDate" className="text-sm font-medium block mb-1">
              Delivery Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-6">
        {/* Order Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left border border-gray-200 w-16">No.</th>
                <th className="p-2 text-left border border-gray-200">Description</th>
                <th className="p-2 text-left border border-gray-200 w-24">Quantity</th>
                <th className="p-2 text-left border border-gray-200 w-32">Unit Price</th>
                <th className="p-2 text-left border border-gray-200 w-32">Total</th>
                <th className="p-2 text-center border border-gray-200 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-200 text-center">{index + 1}</td>
                  <td className="p-2 border border-gray-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between">
                          {item.description}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {products.map(product => (
                          <DropdownMenuItem 
                            key={product.id} 
                            onClick={() => handleSelectProduct(index, product.id)}
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
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Add Custom Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Enter the details for your custom item.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="customName" className="text-right">
                                  Name
                                </label>
                                <Input
                                  id="customName"
                                  value={customProduct.name}
                                  onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="customPrice" className="text-right">
                                  Price
                                </label>
                                <Input
                                  id="customPrice"
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={customProduct.price}
                                  onChange={(e) => setCustomProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                  className="col-span-3"
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* Notes for the item */}
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        Note: {item.notes}
                      </div>
                    )}
                    {/* Add notes field */}
                    <Input
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
                      className="mt-1 text-xs h-7"
                    />
                  </td>
                  <td className="p-2 border border-gray-200">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </td>
                  <td className="p-2 border border-gray-200">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="p-2 border border-gray-200 font-medium">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="p-2 border border-gray-200 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleRemoveRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {/* Empty state row */}
              {orderItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    No items added. Click "Add Item" to begin your order.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={4} className="p-2 text-right border border-gray-200 font-medium">
                  Total:
                </td>
                <td className="p-2 border border-gray-200 font-bold">
                  ${getCartTotal().toFixed(2)}
                </td>
                <td className="p-2 border border-gray-200"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <Button 
          onClick={addNewRow}
          className="mt-4"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
        
        {/* Special Instructions */}
        <div className="mt-6">
          <label htmlFor="specialInstructions" className="text-sm font-medium block mb-2">
            Special Instructions
          </label>
          <Textarea
            id="specialInstructions"
            placeholder="Add any special instructions for this order..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="resize-none h-24"
          />
        </div>
        
        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" disabled={isSubmitting || orderItems.length === 0}>
                {isSubmitting ? "Submitting..." : "Submit Order"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
  );
};

export default OrderForm;
