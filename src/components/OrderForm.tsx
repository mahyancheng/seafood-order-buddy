
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
        
        {/* Client Information */}
        <div className="grid grid-cols-1 gap-3 mt-4 border p-3 rounded-md bg-gray-50">
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
              className="resize-none h-16"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-3 sm:p-6">
        {/* Order Items Table - Mobile Optimized View */}
        <div className="mb-4">
          <h3 className="font-medium text-sm mb-2">Order Items</h3>
          
          {/* Mobile view: Cards instead of table for small screens */}
          <div className="block md:hidden space-y-3">
            {orderItems.length > 0 ? (
              orderItems.map((item, index) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="bg-gray-100 p-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center mr-2">
                        {index + 1}
                      </span>
                      <h4 className="font-medium truncate max-w-[150px]">{item.description}</h4>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => handleRemoveRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Item</label>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Quantity</label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                          className="w-full h-8 text-sm p-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Unit Price</label>
                        <div className="h-8 flex items-center border px-2 rounded-md bg-muted/30 text-sm">
                          ${item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Notes</label>
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
                        className="text-xs h-7"
                      />
                    </div>
                    
                    <div className="pt-1 border-t flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Total:</span>
                      <span className="font-bold text-sm">${item.total.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground bg-muted/20 rounded-md">
                No items added. Tap "Add Item" to begin your order.
              </div>
            )}
          </div>
          
          {/* Desktop view: Traditional table for larger screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border border-gray-200 w-10 sm:w-16">No.</th>
                  <th className="p-2 text-left border border-gray-200">Description</th>
                  <th className="p-2 text-left border border-gray-200 w-16 sm:w-24">Qty</th>
                  <th className="p-2 text-left border border-gray-200 w-20 sm:w-32">Unit Price</th>
                  <th className="p-2 text-left border border-gray-200 w-20 sm:w-32">Total</th>
                  <th className="p-2 text-center border border-gray-200 w-10 sm:w-16"></th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-200 text-center">{index + 1}</td>
                    <td className="p-2 border border-gray-200">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between text-sm h-8">
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Notes for the item */}
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
                        className="w-full h-8 text-sm p-1"
                      />
                    </td>
                    <td className="p-2 border border-gray-200 text-sm">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-2 border border-gray-200 font-medium text-sm">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="p-2 border border-gray-200 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-destructive"
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
        </div>
        
        {/* Total for mobile view */}
        <div className="md:hidden bg-gray-100 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Order Total:</span>
            <span className="text-xl font-bold">${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
        
        <Button 
          onClick={addNewRow}
          className="mt-2 mb-4 w-full md:w-auto"
          variant="outline"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
        
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
  );
};

export default OrderForm;
