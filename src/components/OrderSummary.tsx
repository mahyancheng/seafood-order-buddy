import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Trash2, Plus, Minus, Send, FileEdit } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner"; // Add this import for toast

const OrderSummary: React.FC = () => {
  const { cart, products, updateProductQuantity, removeProductFromCart, submitOrder, getCartTotal } = useOrder();
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now() + 86400000)); // Tomorrow
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: ""
  });
  const [clientFormOpen, setClientFormOpen] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateProductQuantity(productId, newQuantity);
    } else {
      removeProductFromCart(productId);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
  };

  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    // Validate client info
    if (!clientInfo.name || !clientInfo.address || !clientInfo.contactPerson || !clientInfo.phone) {
      toast.error("Please fill in all required client information");
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      submitOrder(clientInfo);
      setClientInfo({
        name: "",
        address: "",
        contactPerson: "",
        phone: "",
        email: ""
      });
      setSpecialInstructions("");
      setIsSubmitting(false);
      setClientFormOpen(false);
    }, 1000);
  };

  const cartTotal = getCartTotal();

  return (
    <Card className="h-full flex flex-col animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-medium">Cart Summary</CardTitle>
            <CardDescription>
              Review and submit your order
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <div className="px-6 py-2">
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-muted-foreground">Delivery Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "text-sm justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                size="sm"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No items in cart yet. Add products from the list.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="flex items-center justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{product.name}</h4>
                          <span className="font-medium">
                            ${(product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>${product.price.toFixed(2)} / {product.unit}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 0.1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseFloat(e.target.value))}
                              className="w-16 h-7 text-center"
                              step="0.1"
                              min="0.1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 0.1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeProductFromCart(item.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-xs italic mt-1 text-muted-foreground">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="space-y-3 pt-4">
              <Separator />
              <div className="flex justify-between text-lg font-medium">
                <span>Total:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="specialInstructions" className="text-sm font-medium">
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
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-6">
        <Dialog open={clientFormOpen} onOpenChange={setClientFormOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              size="lg"
              disabled={cart.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Proceed to Checkout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Client Information</DialogTitle>
              <DialogDescription>
                Enter client details for the order
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm">
                  Company Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={clientInfo.name}
                  onChange={handleClientInfoChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="address" className="text-right text-sm">
                  Address *
                </label>
                <Input
                  id="address"
                  name="address"
                  value={clientInfo.address}
                  onChange={handleClientInfoChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="contactPerson" className="text-right text-sm">
                  Contact Person *
                </label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={clientInfo.contactPerson}
                  onChange={handleClientInfoChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right text-sm">
                  Phone *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={clientInfo.phone}
                  onChange={handleClientInfoChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={clientInfo.email}
                  onChange={handleClientInfoChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isSubmitting}>
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
