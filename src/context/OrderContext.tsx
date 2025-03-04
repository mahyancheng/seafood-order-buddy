
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

// Types
export interface Client {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
}

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
  clientId: string;
  items: OrderItem[];
  status: "draft" | "submitted" | "processing" | "completed" | "cancelled";
  deliveryDate: string;
  specialInstructions: string;
  createdAt: string;
  total: number;
}

interface OrderContextType {
  clients: Client[];
  products: Product[];
  orders: Order[];
  currentOrder: Order | null;
  selectedClient: Client | null;
  selectClient: (clientId: string) => void;
  addProductToOrder: (productId: string, quantity: number, notes: string) => void;
  removeProductFromOrder: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  updateOrderNotes: (notes: string) => void;
  updateDeliveryDate: (date: string) => void;
  submitOrder: () => void;
  resetOrder: () => void;
}

// Mock data
const MOCK_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Ocean Bistro",
    address: "123 Pier Street, Harbor City, CA 90001",
    contactPerson: "Michael Chen",
    phone: "(555) 123-4567",
    email: "chef@oceanbistro.com",
  },
  {
    id: "c2",
    name: "The Fish Market",
    address: "456 Coastal Highway, Bayview, CA 90002",
    contactPerson: "Sarah Johnson",
    phone: "(555) 987-6543",
    email: "orders@fishmarket.com",
  },
  {
    id: "c3",
    name: "Seaside Restaurant",
    address: "789 Beach Blvd, Sandshore, CA 90003",
    contactPerson: "David Wilson",
    phone: "(555) 456-7890",
    email: "info@seasiderestaurant.com",
  },
];

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
  const [clients] = useState<Client[]>(MOCK_CLIENTS);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Select a client for the order
  const selectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId) || null;
    setSelectedClient(client);
    
    // Initialize a new order when a client is selected
    if (client) {
      setCurrentOrder({
        id: `order-${Date.now()}`,
        clientId: client.id,
        items: [],
        status: "draft",
        deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        specialInstructions: "",
        createdAt: new Date().toISOString(),
        total: 0
      });
      toast.info(`Creating a new order for ${client.name}`);
    }
  };

  // Add a product to the order
  const addProductToOrder = (productId: string, quantity: number, notes: string) => {
    if (!currentOrder) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is already in order
    const existingItemIndex = currentOrder.items.findIndex(item => item.productId === productId);
    
    const updatedItems = [...currentOrder.items];
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        notes
      };
      toast.info(`Updated ${product.name} quantity in order`);
    } else {
      // Add new item
      updatedItems.push({
        productId,
        quantity,
        unitPrice: product.price,
        notes
      });
      toast.success(`Added ${product.name} to order`);
    }
    
    // Calculate new total
    const newTotal = updatedItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    setCurrentOrder({
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    });
  };

  // Remove a product from the order
  const removeProductFromOrder = (productId: string) => {
    if (!currentOrder) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedItems = currentOrder.items.filter(item => item.productId !== productId);
    
    // Calculate new total
    const newTotal = updatedItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    setCurrentOrder({
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    });
    
    toast.success(`Removed ${product.name} from order`);
  };

  // Update product quantity
  const updateProductQuantity = (productId: string, quantity: number) => {
    if (!currentOrder) return;
    
    const updatedItems = currentOrder.items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    // Calculate new total
    const newTotal = updatedItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    setCurrentOrder({
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    });
  };

  // Update order notes
  const updateOrderNotes = (notes: string) => {
    if (!currentOrder) return;
    
    setCurrentOrder({
      ...currentOrder,
      specialInstructions: notes
    });
  };

  // Update delivery date
  const updateDeliveryDate = (date: string) => {
    if (!currentOrder) return;
    
    setCurrentOrder({
      ...currentOrder,
      deliveryDate: date
    });
  };

  // Submit the order
  const submitOrder = () => {
    if (!currentOrder || !selectedClient) return;
    
    const submittedOrder = {
      ...currentOrder,
      status: "submitted" as const,
    };
    
    setOrders([...orders, submittedOrder]);
    toast.success(`Order for ${selectedClient.name} submitted successfully!`);
    
    // Reset current order and selected client
    setCurrentOrder(null);
    setSelectedClient(null);
  };

  // Reset the current order
  const resetOrder = () => {
    setCurrentOrder(null);
    setSelectedClient(null);
  };

  // Context value
  const value: OrderContextType = {
    clients,
    products,
    orders,
    currentOrder,
    selectedClient,
    selectClient,
    addProductToOrder,
    removeProductFromOrder,
    updateProductQuantity,
    updateOrderNotes,
    updateDeliveryDate,
    submitOrder,
    resetOrder,
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
