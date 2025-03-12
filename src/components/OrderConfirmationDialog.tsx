
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/ui/order-summary";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

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

  const { t, i18n } = useTranslation("global");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[85%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#ea384c]">
          {t("order.order_submitted_success")}
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
          {t("order.done")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
