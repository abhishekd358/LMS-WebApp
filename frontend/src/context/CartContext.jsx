
import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";


const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);




  // cart data fetch fro backedn 
const loadCart = async () => {
    const { data } = await axiosInstance.get("/cart");
    
    const formatted = data.map((item) => ({
      ...item.courseId,
      quantity: item.quantity,
    }));
    
    setCart(formatted);
  };




const addToCart = async (course) => {
  await axiosInstance.post("/cart", {
    courseId: course._id,
  });

  setCart((prev) => {
    const exists = prev.find((i) => i._id === course._id);
    if (exists) {
      return prev.map((i) =>
        i._id === course._id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    return [...prev, { ...course, quantity: 1 }];
  });

  await loadCart()
};


  const removeFromCart = async (course) => {
    const {data} = await axiosInstance.delete(`/cart/${course._id}`);
    const formatted = data.cart.courses.map((item) => ({
    ...item.courseId,
    quantity: item.quantity,
  }));

  setCart(formatted);
  };

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, cartCount, setCart, loadCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
