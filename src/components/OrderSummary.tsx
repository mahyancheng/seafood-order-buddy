
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

const OrderSummary: React.FC = () => {
  const { currentOrder, selectedClient, products, updateProductQuantity, removeProductFromOrder, updateOrderNotes, updateDeliveryDate, submitOrder } = useOrder();
  const [date, setDate] = useState<Date | undefined>(
    currentOrder?.deliveryDate ? new Date(currentOrder.deliveryDate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentOrder || !selectedClient) {
    return (
      <Card className="h-full flex items-center justify-center animate-fade-in">
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">
            Select a client to start a new order
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateProductQuantity(productId, newQuantity);
    } else {
      removeProductFromOrder(productId);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateOrderNotes(e.target.value);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      updateDeliveryDate(format(date, "yyyy-MM-dd"));
    }
  };

  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      submitOrder();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card className="h-full flex flex-col animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-medium">Order Summary</CardTitle>
            <CardDescription>
              Review and submit your order
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FileEdit className="h-4 w-4" />
                <span className="hidden sm:inline">Client Info</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Client Information</DialogTitle>
                <DialogDescription>
                  Details for delivery and contact
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <p className="text-sm">{selectedClient.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Contact Person</label>
                    <p className="text-sm">{selectedClient.contactPerson}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm">{selectedClient.phone}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm">{selectedClient.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Delivery Address</label>
                    <p className="text-sm">{selectedClient.address}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <div className="px-6 py-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Client:</span>
          <span className="font-medium">{selectedClient.name}</span>
        </div>
        
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
        <ScrollArea className="h-[calc(100vh-470px)]">
          <div className="px-6 py-4 space-y-4">
            {currentOrder.items.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No items in order yet. Add products from the list.
              </div>
            ) : (
              <div className="space-y-4">
                {currentOrder.items.map((item) => {
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
                              onClick={() => removeProductFromOrder(item.productId)}
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
                <span>${currentOrder.total.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="specialInstructions" className="text-sm font-medium">
                  Special Instructions
                </label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Add any special instructions for this order..."
                  value={currentOrder.specialInstructions}
                  onChange={handleNotesChange}
                  className="resize-none h-24"
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full" 
              size="lg"
              disabled={currentOrder.items.length === 0 || isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Order"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Order Submission</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit this order for {selectedClient.name}?
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
      </CardFooter>
    </Card>
  );
};

export default OrderSummary;
