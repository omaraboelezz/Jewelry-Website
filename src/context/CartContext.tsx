import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// تعريف شكل المنتج الأساسي
interface Product {
  id: number | string;
  name: string;
  price: number;
  image: string;
  [key: string]: any; // للسماح بأي خصائص إضافية
}

// تعريف عنصر السلة (المنتج + الكمية)
export interface CartItem extends Product {
  quantity: number;
}

// تعريف الوظائف المتاحة في السلة
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

  // حفظ البيانات في localStorage عند أي تغيير
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ دالة تنضيف المنتجات المحذوفة من الـ API
  const cleanupDeletedProducts = async () => {
    if (cartItems.length === 0) return;

    try {
      const response = await fetch('https://omarawad9.pythonanywhere.com/api/products/');

      if (!response.ok) {
        return;
      }

      const existingProducts = await response.json();
      const existingIds = new Set(existingProducts.map((p: any) => p.id));

      // ✅ فلترة المنتجات الموجودة فعليًا فقط
      const validCartItems = cartItems.filter(item => existingIds.has(item.id));

      // ✅ لو في منتجات اتمسحت، حدث الـ Cart
      if (validCartItems.length !== cartItems.length) {
        const removedCount = cartItems.length - validCartItems.length;
        setCartItems(validCartItems);
      }
    } catch (error) {
      return;
    }
  };

  // ✅ تشغيل التنضيف عند فتح الصفحة (مرة واحدة)
  useEffect(() => {
    if (cartItems.length > 0) {
      cleanupDeletedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // يشتغل مرة واحدة فقط عند التحميل

  // دالة إضافة منتج للسلة
  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // لو موجود بالفعل، زود الكمية
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // لو جديد، ضيفه مع الكمية
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // دالة حذف منتج
  const removeFromCart = (id: number | string) => {
    setCartItems(prevItems =>
      prevItems
        .map(item => {
          if (item.id === id) {
            if (item.quantity > 1) {
              return { ...item, quantity: item.quantity - 1 }; // نقص وحدة واحدة
            } else {
              return null; // لو الكمية 1 نمسح المنتج
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