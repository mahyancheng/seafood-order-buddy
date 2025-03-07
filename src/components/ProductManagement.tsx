
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
  
  // Since we can't directly modify the context, we'll create a local copy to manage
  const [products, setProducts] = useState<Product[]>(allProducts);
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
      toast.error("Please fill in all required fields");
      return;
    }
    
    const productToAdd: Product = {
      ...newProduct,
      id: `p${Date.now()}`,
    };
    
    setProducts([...products, productToAdd]);
    setNewProduct(emptyProduct);
    setIsAddDialogOpen(false);
    toast.success(`Product "${productToAdd.name}" added successfully`);
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;
    
    if (!editingProduct.name || !editingProduct.category || editingProduct.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setProducts(products.map(p => 
      p.id === editingProduct.id ? editingProduct : p
    ));
    
    setIsEditDialogOpen(false);
    toast.success(`Product "${editingProduct.name}" updated successfully`);
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;
    
    setProducts(products.filter(p => p.id !== productId));
    toast.success(`Product "${productToDelete.name}" deleted successfully`);
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
      toast.success(`${product.name} is now ${!product.available ? 'available' : 'unavailable'}`);
    }
  };

  const ProductForm = ({ 
    product, 
    setProduct, 
    isNew = false 
  }: { 
    product: Product | Omit<Product, "id">, 
    setProduct: React.Dispatch<React.SetStateAction<any>>,
    isNew?: boolean
  }) => {
    return (
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="product-name" className="text-sm font-medium mb-1 block">
              Product Name *
            </label>
            <Input
              id="product-name"
              value={product.name}
              onChange={(e) => setProduct({...product, name: e.target.value})}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-category" className="text-sm font-medium mb-1 block">
                Category *
              </label>
              <Input
                id="product-category"
                value={product.category}
                onChange={(e) => setProduct({...product, category: e.target.value})}
                placeholder="e.g. Fish, Shellfish"
              />
            </div>
            
            <div>
              <label htmlFor="product-unit" className="text-sm font-medium mb-1 block">
                Unit *
              </label>
              <select
                id="product-unit"
                value={product.unit}
                onChange={(e) => setProduct({...product, unit: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="lb">Pound (lb)</option>
                <option value="oz">Ounce (oz)</option>
                <option value="dozen">Dozen</option>
                <option value="piece">Piece</option>
                <option value="box">Box</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="product-price" className="text-sm font-medium mb-1 block">
              Price per Unit *
            </label>
            <Input
              id="product-price"
              type="number"
              min="0.01"
              step="0.01"
              value={product.price}
              onChange={(e) => setProduct({...product, price: parseFloat(e.target.value)})}
              placeholder="Enter price"
            />
          </div>
          
          <div>
            <label htmlFor="product-image" className="text-sm font-medium mb-1 block">
              Image URL
            </label>
            <Input
              id="product-image"
              value={product.image}
              onChange={(e) => setProduct({...product, image: e.target.value})}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="product-available"
              checked={product.available}
              onChange={(e) => setProduct({...product, available: e.target.checked})}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="product-available" className="text-sm font-medium">
              Product Available for Sale
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>
              Add, edit, and manage product inventory
            </CardDescription>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm product={newProduct} setProduct={setNewProduct} isNew={true} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>
                  Add Product
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
              placeholder="Search products..." 
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
            <option value="all">All Categories</option>
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
                  ? "No products found matching your search criteria"
                  : "No products have been added yet"}
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
                            ${product.price.toFixed(2)} / {product.unit}
                          </span>
                          {!product.available && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                              Unavailable
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
                        title={product.available ? "Mark as unavailable" : "Mark as available"}
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
    </Card>
  );
  
  // Dialog for editing product
  return (
    <>
      {/* ... main component ... */}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm product={editingProduct} setProduct={setEditingProduct} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductManagement;
