import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Product {
  id: number | string;
  name: string;
  price: number;
  image: string;
  [key: string]: any; 
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: number | string) => void;
  clearCart: () => void;
  cartCount: number;
  cleanupDeletedProducts: () => Promise<void>; // ✅ إضافة دالة التنضيف
  removeEntireItem: (id: number | string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // تحميل البيانات من localStorage عند البدء
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const cleanupDeletedProducts = async () => {
    if (cartItems.length === 0) return;

    try {
      const response = await fetch('https://OmarElsayed49.pythonanywhere.com/api/products/');

      if (!response.ok) {
        return;
      }

      const existingProducts = await response.json();
      const existingIds = new Set(existingProducts.map((p: any) => p.id));

      const validCartItems = cartItems.filter(item => existingIds.has(item.id));

      if (validCartItems.length !== cartItems.length) {
        const removedCount = cartItems.length - validCartItems.length;
        setCartItems(validCartItems);
      }
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      cleanupDeletedProducts();
    }
  }, []); 

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (id: number | string) => {
    setCartItems(prevItems =>
      prevItems
        .map(item => {
          if (item.id === id) {
            if (item.quantity > 1) {
              return { ...item, quantity: item.quantity - 1 }; // نقص وحدة واحدة
            } else {
              return null;
            }
          }
          return item;
        })
        .filter(Boolean) as CartItem[] // نحذف العناصر null
    );
  };

  // دالة حذف العنصر بالكامل من السلة
  const removeEntireItem = (id: number | string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // دالة تفريغ السلة بالكامل
  const clearCart = () => {
    setCartItems([]);
  };

  // حساب عدد العناصر الكلي (لعرضه في الهيدر)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cleanupDeletedProducts, // ✅ تصدير الدالة
        removeEntireItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook لاستخدام السلة في أي مكان
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};