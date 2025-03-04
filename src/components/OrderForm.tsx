
import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fish, Crab, Search } from "lucide-react";
import ProductItem from "./ProductItem";
import { Input } from "@/components/ui/input";
import { Product } from "@/context/OrderContext";

const OrderForm: React.FC = () => {
  const { products } = useOrder();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Filter products by category and search term
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Get unique categories
  const categories = ["all", ...Array.from(new Set(products.map((product) => product.category.toLowerCase())))];

  return (
    <Card className="h-full flex flex-col animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium">Select Products</CardTitle>
        <CardDescription>
          Browse and add products to the current order
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 glass-input"
          />
        </div>
      </CardHeader>
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
        <div className="px-6">
          <TabsList className="w-full">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize flex items-center gap-1"
              >
                {category === "fish" && <Fish className="h-4 w-4" />}
                {category === "shellfish" && <Crab className="h-4 w-4" />}
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="flex-1 mt-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <CardContent className="p-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found matching your criteria
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};

export default OrderForm;
