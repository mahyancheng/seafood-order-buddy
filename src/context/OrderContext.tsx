
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

// Types
export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  available: boolean;
  image: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: "draft" | "submitted" | "processing" | "completed" | "cancelled";
  deliveryDate: string;
  specialInstructions: string;
  createdAt: string;
  total: number;
  clientInfo?: {
    name: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
}

interface OrderContextType {
  products: Product[];
  orders: Order[];
  cart: OrderItem[];
  addProductToCart: (productId: string, quantity: number, notes: string) => void;
  removeProductFromCart: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  submitOrder: (clientInfo: Order['clientInfo']) => void;
  getCartTotal: () => number;
}

// Mock data
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Atlantic Salmon",
    category: "Fish",
    unit: "kg",
    price: 21.99,
    available: true,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "p2",
    name: "Pacific Cod",
    category: "Fish",
    unit: "kg",
    price: 18.50,
    available: true,
    image: "https://images.unsplash.com/photo-1544733422-251bdc3e1916?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "p3",
    name: "King Crab",
    category: "Shellfish",
    unit: "kg",
    price: 45.99,
    available: true,
    image: "https://images.unsplash.com/photo-1565217488921-0c942ab9c8bf?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "p4",
    name: "Jumbo Shrimp",
    category: "Shellfish",
    unit: "kg",
    price: 32.50,
    available: true,
    image: "https://images.unsplash.com/photo-1625943913744-8868f32496cd?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "p5",
    name: "Oysters",
    category: "Shellfish",
    unit: "dozen",
    price: 24.99,
    available: true,
    image: "https://images.unsplash.com/photo-1572544931470-84e28c927290?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "p6",
    name: "Yellowfin Tuna",
    category: "Fish",
    unit: "kg",
    price: 28.99,
    available: true,
    image: "https://images.unsplash.com/photo-1513125370-3460ebe3401b?auto=format&fit=crop&q=80&w=200&h=200",
  },
];

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider component
export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Add a product to the cart
  const addProductToCart = (productId: string, quantity: number, notes: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    const updatedItems = [...cart];
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        notes
      };
      toast.info(`Updated ${product.name} quantity in cart`);
    } else {
      // Add new item
      updatedItems.push({
        productId,
        quantity,
        unitPrice: product.price,
        notes
      });
      toast.success(`Added ${product.name} to cart`);
    }
    
    setCart(updatedItems);
  };

  // Remove a product from the cart
  const removeProductFromCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedItems = cart.filter(item => item.productId !== productId);
    setCart(updatedItems);
    
    toast.success(`Removed ${product.name} from cart`);
  };

  // Update product quantity
  const updateProductQuantity = (productId: string, quantity: number) => {
    const updatedItems = cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    setCart(updatedItems);
  };

  // Clear the cart
  const clearCart = () => {
    setCart([]);
    toast.info("Cart has been cleared");
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Submit the order
  const submitOrder = (clientInfo: Order['clientInfo']) => {
    if (cart.length === 0) {
      toast.error("Cannot submit an empty order");
      return;
    }
    
    const submittedOrder: Order = {
      id: `order-${Date.now()}`,
      items: [...cart],
      status: "submitted",
      deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      specialInstructions: "",
      createdAt: new Date().toISOString(),
      total: getCartTotal(),
      clientInfo
    };
    
    setOrders([...orders, submittedOrder]);
    toast.success(`Order submitted successfully!`);
    clearCart();
  };

  // Context value
  const value: OrderContextType = {
    products,
    orders,
    cart,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    clearCart,
    submitOrder,
    getCartTotal
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Custom hook for using the order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
