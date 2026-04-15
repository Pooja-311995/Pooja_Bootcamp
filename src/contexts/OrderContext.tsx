import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface OrderItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  type?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'Order Placed' | 'Preparing' | 'Ready For Pick-Up' | 'Order Picked';
  orderDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  statusStartTime?: string;
  review?: {
    rating: number;
    comment: string;
    reviewDate: string;
  };
}

// Function to generate random Order ID
const generateOrderId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'ORD-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isFirstOrder: boolean;
  userPreference: string | null;
}

type OrderAction =
  | { type: 'PLACE_ORDER'; payload: Omit<Order, 'id' | 'status' | 'orderDate' | 'estimatedDelivery'> }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'ADD_REVIEW'; payload: { orderId: string; review: Order['review'] } }
  | { type: 'SET_CURRENT_ORDER'; payload: Order | null };

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'orderDate' | 'estimatedDelivery'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addReview: (orderId: string, review: Order['review']) => void;
  getUserPreference: () => string;
} | null>(null);

// Function to determine user preference based on first order
// Uses the 'type' field from menu items (hot/cold/mocha)
const determineUserPreference = (items: OrderItem[]): string => {
  if (items.length === 0) return 'default';
  
  console.log('🎯 Determining user preference from order items:', items);
  
  // Count coffee types
  const typeCounts = { hot: 0, cold: 0, mocha: 0 };
  
  items.forEach(item => {
    const type = (item as any).type?.toLowerCase();
    console.log(`  - ${item.title}: type = ${type || 'none'}`);
    
    if (type === 'hot') typeCounts.hot++;
    else if (type === 'cold') typeCounts.cold++;
    else if (type === 'mocha' || type === 'cocoa') typeCounts.mocha++;
  });
  
  console.log('📊 Type counts:', typeCounts);
  
  // Return the dominant type
  const maxCount = Math.max(typeCounts.hot, typeCounts.cold, typeCounts.mocha);
  
  if (maxCount === 0) {
    console.log('⚠️ No types found, using default preference');
    return 'default';
  }
  
  let preference = 'default';
  if (typeCounts.mocha === maxCount) preference = 'mocha';
  else if (typeCounts.cold === maxCount) preference = 'cold';
  else if (typeCounts.hot === maxCount) preference = 'hot';
  
  console.log('✅ User preference determined:', preference);
  return preference;
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'PLACE_ORDER': {
      const newOrder: Order = {
        ...action.payload,
        id: generateOrderId(),
        status: 'Order Placed',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 30 * 1000).toISOString(), // ~30 seconds total time (5+5+15+5)
        statusStartTime: new Date().toISOString()
      };
      
      // Determine if this is the first order and set user preference
      const isFirstOrder = state.orders.length === 0;
      const userPreference = isFirstOrder ? determineUserPreference(action.payload.items) : state.userPreference;
      
      return {
        ...state,
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
        isFirstOrder,
        userPreference
      };
    }
    
    case 'UPDATE_ORDER_STATUS': {
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.orderId
          ? { 
              ...order, 
              status: action.payload.status,
              statusStartTime: new Date().toISOString(),
              actualDelivery: action.payload.status === 'Order Picked' ? new Date().toISOString() : order.actualDelivery
            }
          : order
      );
      
      return {
        ...state,
        orders: updatedOrders,
        currentOrder: state.currentOrder?.id === action.payload.orderId 
          ? { ...state.currentOrder, status: action.payload.status, statusStartTime: new Date().toISOString() }
          : state.currentOrder
      };
    }
    
    case 'ADD_REVIEW': {
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.orderId
          ? { ...order, review: action.payload.review }
          : order
      );
      
      return {
        ...state,
        orders: updatedOrders
      };
    }
    
    case 'SET_CURRENT_ORDER': {
      return {
        ...state,
        currentOrder: action.payload
      };
    }
    
    default:
      return state;
  }
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, {
    orders: [],
    currentOrder: null,
    isFirstOrder: true,
    userPreference: null
  });

  // Order status timer system with auto-progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    state.orders.forEach(order => {
      if (order.status === 'Order Placed') {
        const timer = setTimeout(() => {
          dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: 'Preparing' } });
        }, 5000); // 5 seconds
        timers.push(timer);
      } else if (order.status === 'Preparing') {
        const timer = setTimeout(() => {
          dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: 'Ready For Pick-Up' } });
        }, 5000); // 5 seconds
        timers.push(timer);
      } else if (order.status === 'Ready For Pick-Up') {
        const timer = setTimeout(() => {
          dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: 'Order Picked' } });
        }, 15000); // 15 seconds
        timers.push(timer);
      }
      // 'Order Picked' final status has 5 second display timer but no progression
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.orders]);

  const placeOrder = (orderData: Omit<Order, 'id' | 'status' | 'orderDate' | 'estimatedDelivery'>) => {
    dispatch({ type: 'PLACE_ORDER', payload: orderData });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
  };

  const addReview = (orderId: string, review: Order['review']) => {
    dispatch({ type: 'ADD_REVIEW', payload: { orderId, review } });
  };

  const getUserPreference = (): string => {
    return state.userPreference || 'default';
  };

  return (
    <OrderContext.Provider value={{ state, dispatch, placeOrder, updateOrderStatus, addReview, getUserPreference }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
