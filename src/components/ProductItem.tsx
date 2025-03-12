
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOrder } from "@/context/OrderContext";
import { Product } from "@/context/OrderContext";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface ProductItemProps {
  product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { addProductToCart } = useOrder();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation("global");
  

  const handleAddToCart = () => {
    setIsLoading(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      addProductToCart(product.id, quantity, notes);
      setQuantity(1);
      setNotes("");
      setIsLoading(false);
    }, 300);
  };

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
      <CardContent className="flex-grow p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">{product.name}</h3>
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>
        
        <Badge
          variant="secondary"
          className="mb-3 font-medium"
        >  ${product.price.toFixed(2)} / {t(`unit.${product.unit}`)}
        </Badge>
        
        <div className="space-y-3 mt-3">
          <div>
            <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium mb-1 block">
            {t("product.quantity_label", { unit: product.unit })}
            </label>
            <Input
              id={`quantity-${product.id}`}
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              className="glass-input"
            />
          </div>
          
          <div>
            <label htmlFor={`notes-${product.id}`} className="text-sm font-medium mb-1 block">
            {t("product.special_instructions")}
            </label>
            <Textarea
              id={`notes-${product.id}`}
              placeholder={t("product.special_instructions_placeholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input h-20 text-sm resize-none"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full group"
          disabled={isLoading || quantity <= 0}
        >
          <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
          {isLoading ? t("product.adding_to_cart") : t("product.add_to_cart")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductItem;
