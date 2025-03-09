
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface OrderSummaryProps {
  items: Item[];
  specialInstructions?: string;
  clientInfo: {
    name: string;
    address?: string;
    contactPerson: string;
    phone: string;
    email?: string;
  };
  deliveryDate?: Date;
}

export function OrderSummary({ items, specialInstructions, clientInfo, deliveryDate }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  return (
    <Card className="w-full border rounded-lg shadow-md">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-xl md:text-2xl font-bold text-center">Order Summary</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Client Information */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm md:text-base">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm bg-muted/10 p-3 rounded-md">
            <div>
              <span className="text-muted-foreground">Client Name:</span>
              <span className="ml-2 font-medium">{clientInfo.name}</span>
            </div>
            {clientInfo.address && (
              <div>
                <span className="text-muted-foreground">Address:</span>
                <span className="ml-2">{clientInfo.address}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Contact Person:</span>
              <span className="ml-2">{clientInfo.contactPerson}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <span className="ml-2">{clientInfo.phone}</span>
            </div>
            {clientInfo.email && (
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2">{clientInfo.email}</span>
              </div>
            )}
            {deliveryDate && (
              <div>
                <span className="text-muted-foreground">Delivery Date:</span>
                <span className="ml-2">{deliveryDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Items */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm md:text-base">Order Items</h3>
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted/20 grid grid-cols-12 gap-1 p-2 text-xs font-medium border-b">
              <div className="col-span-5 md:col-span-6">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Unit</div>
              <div className="col-span-3 md:col-span-2 text-right">Price</div>
            </div>
            <div className="divide-y">
              {items.map((item, index) => (
                <div key={index} className={`grid grid-cols-12 gap-1 p-2 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-muted/5'}`}>
                  <div className="col-span-5 md:col-span-6">
                    {item.description}
                    {item.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-center">unit</div>
                  <div className="col-span-3 md:col-span-2 text-right font-medium">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Totals */}
        <div className="space-y-2">
          <Separator />
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center font-bold">
            <span>Total</span>
            <span className="text-lg">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Special Instructions */}
        {specialInstructions && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm md:text-base">Special Instructions</h3>
            <div className="bg-muted/10 p-3 rounded-md text-sm">
              {specialInstructions}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
