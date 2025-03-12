
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useOrder } from "@/context/OrderContext";
import { Product } from "@/context/OrderContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Edit, Trash2, Package, FileImage, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  category: "",
  unit: "kg",
  price: 0,
  available: true,
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200&h=200",
};

const ProductManagement: React.FC = () => {
  const { products: allProducts } = useOrder();
  const { t, i18n } = useTranslation("global");

  const [products, setProducts] = useState<Product[]>(() => allProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>(emptyProduct);

  // Derive unique categories from products
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
      toast.error(t("product.toast_error_required"));
      return;
    }
    
    const productToAdd: Product = {
      ...newProduct,
      id: `p${Date.now()}`,
    };
    
    setProducts([...products, productToAdd]);
    setNewProduct(emptyProduct);
    setIsAddDialogOpen(false);
    toast.success(t("product.toast_add_success", { name: productToAdd.name }));
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;
    
    if (!editingProduct.name || !editingProduct.category || editingProduct.price <= 0) {
      toast.error(t("product.toast_error_required"));
      return;
    }
    
    setProducts(products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    ));
    
    setIsEditDialogOpen(false);
    toast.success(t("product.toast_edit_success", { name: editingProduct.name }));
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;
    
    setProducts(products.filter(p => p.id !== productId));
    toast.success(t("product.toast_delete_success", { name: productToDelete.name }));
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct({...product});
    setIsEditDialogOpen(true);
  };

  const handleToggleAvailability = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? {...p, available: !p.available} : p
    ));
    
    const product = products.find(p => p.id === productId);
    if (product) {
      toast.success(t("product.toast_toggle_availability", { 
        name: product.name, 
        status: !product.available ? t("common.available") : t("common.unavailable") 
      }));
    }
  };

    
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
          <CardTitle>{t("product.title")}</CardTitle>
          <CardDescription>{t("product.description")}</CardDescription>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("product.add_button")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("product.add_dialog_title")}</DialogTitle>
              </DialogHeader>
              <ProductForm product={newProduct} setProduct={setNewProduct} />
              <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("product.cancel_button")}
              </Button>
              <Button onClick={handleAddProduct}>
                {t("product.add_button")}
              </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder={t("product.searchPlaceholder")} 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-48"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{t("product.allCategories")}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <ScrollArea className="h-[400px] w-full pr-4">
        <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || categoryFilter !== "all" 
                  ? t("product.noResults")
                  : t("product.noProducts")}
              </div>
            ) : (
              filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`border p-4 rounded-lg transition-colors ${
                    product.available 
                      ? 'hover:border-primary/50 hover:bg-primary/5' 
                      : 'bg-secondary/30 hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center h-10 w-10 bg-primary/10 rounded">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${product.price.toFixed(2)} / {t(`unit.${product.unit}`)}
                          </span>
                          {!product.available && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                              {t("product.unavailable")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleAvailability(product.id)}
                        title={product.available ? t("product.markUnavailable") : t("product.markAvailable")}
                      >
                        {product.available ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClick(product)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("product.editTitle")}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm product={editingProduct} setProduct={setEditingProduct} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEditProduct}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {/* <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("product.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p>{t("product.deleteConfirmation", { name: editingProduct?.name })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteProduct(editingProduct?.id)}
            >
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>*/}
    </Card> 

  );
};  

const ProductForm: React.FC<{ product: Product | Omit<Product, "id">; setProduct: React.Dispatch<React.SetStateAction<any>> }> = ({ product, setProduct }) => {
  const { t, i18n } = useTranslation("global");

  return (
  <div className="space-y-4 py-4">
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor="product-name" className="text-sm font-medium mb-1 block">
          {t("product.name_label")}
        </label>
        <Input
          id="product-name"
          value={product.name}
          onChange={(e) => setProduct((prev) => ({ ...prev, name: e.target.value }))}
          placeholder={t("product.name_placeholder")}
        />

      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="product-category" className="text-sm font-medium mb-1 block">
          {t("product.category_label")}
          </label>
          <Input
          id="product-category"
          value={product.category}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
          placeholder={t("product.category_placeholder")}
        />
        </div>
        
        <div>
        <label htmlFor="product-unit" className="text-sm font-medium mb-1 block">
          {t("product.unit_label")}
        </label>
          <select
            id="product-unit"
            value={product.unit}
            onChange={(e) => setProduct({...product, unit: e.target.value})}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="kg">{t("unit.kg")}</option>
            <option value="g">{t("unit.g")}</option>
            <option value="lb">{t("unit.lb")}</option>
            <option value="oz">{t("unit.oz")}</option>
            <option value="dozen">{t("unit.dozen")}</option>
            <option value="piece">{t("unit.piece")}</option>
            <option value="box">{t("unit.box")}</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="product-price" className="text-sm font-medium mb-1 block">
        {t("product.price_label")}
        </label>
        <Input
        id="product-price"
        type="number"
        min="0.01"
        step="0.01"
        value={product.price}
        onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
        placeholder={t("product.price_placeholder")}
      />
      </div>
      
      <div>
        <label htmlFor="product-image" className="text-sm font-medium mb-1 block">
        {t("product.image_label")}
        </label>
        <Input
        id="product-image"
        value={product.image}
        onChange={(e) => setProduct({ ...product, image: e.target.value })}
        placeholder={t("product.image_placeholder")}
      />
      </div>
      
      <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="product-available"
        checked={product.available}
        onChange={(e) => setProduct({ ...product, available: e.target.checked })}
        className="rounded border-gray-300 text-primary focus:ring-primary"
      />
       <label htmlFor="product-available" className="text-sm font-medium">
        {t("product.availability_label")}
      </label>
      </div>
    </div>
  </div>
);
};

  // Dialog for editing product

export default ProductManagement;
