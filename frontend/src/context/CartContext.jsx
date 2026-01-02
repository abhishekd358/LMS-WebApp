import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 🔹 Load cart (single source of truth)
  const loadCart = async () => {
    const { data } = await axiosInstance.get("/cart");

    const formatted = data.map((item) => ({
      ...item.courseId,
      quantity: item.quantity,
    }));

    setCart(formatted);
  };

  // 🔹 Add item
  const addToCart = async (course) => {
    await axiosInstance.post("/cart", {
      courseId: course._id,
    });

    await loadCart(); // 🔥 ONLY THIS
  };

  // 🔹 Remove item
  const removeFromCart = async (course) => {
    await axiosInstance.delete(`/cart/${course._id}`);

    await loadCart(); // 🔥 ONLY THIS
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, cartCount, loadCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
