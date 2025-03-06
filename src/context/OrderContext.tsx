
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

// Create some mock orders for the past month for demo purposes
const MOCK_ORDERS: Order[] = [
  {
    id: "order-1646316000000",
    items: [
      { productId: "p1", quantity: 5, unitPrice: 21.99, notes: "" },
      { productId: "p3", quantity: 2, unitPrice: 45.99, notes: "" }
    ],
    status: "completed",
    deliveryDate: "2023-03-04",
    specialInstructions: "",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), // 25 days ago
    total: 201.93,
    clientInfo: {
      name: "Oceanside Restaurant",
      address: "123 Beach Blvd, Oceanside, CA",
      contactPerson: "Mike Johnson",
      phone: "555-123-4567",
      email: "mike@oceansiderestaurant.com"
    }
  },
  {
    id: "order-1646402400000",
    items: [
      { productId: "p2", quantity: 10, unitPrice: 18.50, notes: "" },
      { productId: "p4", quantity: 3, unitPrice: 32.50, notes: "" }
    ],
    status: "completed",
    deliveryDate: "2023-03-05",
    specialInstructions: "Please deliver before noon",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), // 20 days ago
    total: 282.50,
    clientInfo: {
      name: "Harbor Grill",
      address: "456 Harbor Dr, Newport Beach, CA",
      contactPerson: "Sarah Williams",
      phone: "555-987-6543",
      email: "sarah@harborgrill.com"
    }
  },
  {
    id: "order-1647266400000",
    items: [
      { productId: "p5", quantity: 15, unitPrice: 24.99, notes: "" },
      { productId: "p6", quantity: 8, unitPrice: 28.99, notes: "" }
    ],
    status: "completed",
    deliveryDate: "2023-03-14",
    specialInstructions: "",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), // 15 days ago
    total: 606.77,
    clientInfo: {
      name: "Coastline Seafood",
      address: "789 Coast Hwy, Laguna Beach, CA",
      contactPerson: "David Lee",
      phone: "555-246-8102",
      email: "david@coastlineseafood.com"
    }
  },
  {
    id: "order-1647698400000",
    items: [
      { productId: "p1", quantity: 7, unitPrice: 21.99, notes: "" },
      { productId: "p4", quantity: 5, unitPrice: 32.50, notes: "" }
    ],
    status: "completed",
    deliveryDate: "2023-03-19",
    specialInstructions: "Leave with kitchen staff",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
    total: 316.93,
    clientInfo: {
      name: "Pacific Bistro",
      address: "1010 Pacific Ave, San Diego, CA",
      contactPerson: "Jennifer Chen",
      phone: "555-369-1478",
      email: "jennifer@pacificbistro.com"
    }
  },
  {
    id: "order-1648044000000",
    items: [
      { productId: "p3", quantity: 3, unitPrice: 45.99, notes: "" },
      { productId: "p2", quantity: 12, unitPrice: 18.50, notes: "" }
    ],
    status: "processing",
    deliveryDate: "2023-03-23",
    specialInstructions: "",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
    total: 359.97,
    clientInfo: {
      name: "Seaside Grill",
      address: "2020 Seaside Dr, Huntington Beach, CA",
      contactPerson: "Robert Taylor",
      phone: "555-741-8523",
      email: "robert@seasidegrill.com"
    }
  },
  {
    id: "order-1648130400000",
    items: [
      { productId: "p6", quantity: 10, unitPrice: 28.99, notes: "" },
      { productId: "p5", quantity: 8, unitPrice: 24.99, notes: "" }
    ],
    status: "submitted",
    deliveryDate: "2023-03-24",
    specialInstructions: "Call before delivery",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    total: 489.82,
    clientInfo: {
      name: "Bay View Restaurant",
      address: "3030 Bay St, San Francisco, CA",
      contactPerson: "Lisa Garcia",
      phone: "555-852-9631",
      email: "lisa@bayviewrestaurant.com"
    }
  }
];

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider component
export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS); // Use mock orders for demo
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
