
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/ui/order-summary";
import { Check } from "lucide-react";

interface OrderConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  orderData: {
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }>;
    specialInstructions?: string;
    clientInfo: {
      name: string;
      address?: string;
      contactPerson: string;
      phone: string;
      email?: string;
    };
    deliveryDate?: Date;
  };
}

export function OrderConfirmationDialog({
  open,
  onClose,
  orderData
}: OrderConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[85%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#ea384c]">
            Order Submitted Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <OrderSummary
            items={orderData.items}
            specialInstructions={orderData.specialInstructions}
            clientInfo={orderData.clientInfo}
            deliveryDate={orderData.deliveryDate}
          />
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="bg-[#ea384c] hover:bg-[#d1293d]">
            <Check className="mr-2 h-4 w-4" />
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
