
import React from "react";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

const OrderHistory: React.FC = () => {
  const { orders, products } = useOrder();
    const { t, i18n } = useTranslation("global");
  
  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{t("order.history_title")}</CardTitle>
        <CardDescription>{t("order.history_description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedOrders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
              {t("order.no_orders")}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <Accordion type="single" collapsible className="w-full">
              {sortedOrders.map((order) => {
                // Find product names for this order
                const itemNames = order.items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return product ? product.name : "Unknown Product";
                });

                return (
                  <AccordionItem key={order.id} value={order.id}>
                    <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                      <div className="flex w-full justify-between items-center pr-4">
                        <div className="text-left">
                          <div className="font-medium">
                            {t("order.order_number", { id: order.id.substring(6, 14) })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()} - 
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            ${order.total.toFixed(2)}
                          </span>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {t(`order.status.${order.status.toLowerCase()}`)}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">{t("order.client_info")}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t("order.company")}:</span> {order.clientInfo?.name}
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("order.contact")}:</span> {order.clientInfo?.contactPerson}
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("order.phone")}:</span> {order.clientInfo?.phone}
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("order.email")}:</span> {order.clientInfo?.email || "N/A"}
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">{t("order.address")}:</span> {order.clientInfo?.address}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">{t("order.items")}</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => {
                              const product = products.find(p => p.id === item.productId);
                              return (
                                <div key={index} className="flex justify-between text-sm">
                                  <div>
                                    <span className="font-medium">{product?.name}</span>
                                    <span className="text-muted-foreground ml-2">
                                      ({item.quantity} {product?.unit})
                                    </span>
                                  </div>
                                  <div>${(item.unitPrice * item.quantity).toFixed(2)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-between pt-2 border-t text-sm font-medium">
                          <span>{t("order.total")}</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>

                        {order.specialInstructions && (
                          <div className="pt-2">
                            <span className="text-sm font-medium">{t("order.special_instructions")}</span>
                            <p className="text-sm text-muted-foreground mt-1">{order.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
