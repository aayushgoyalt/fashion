"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial load from LocalStorage (for guests)
  useEffect(() => {
    const localCart = localStorage.getItem("aura_cart");
    if (localCart) {
      setCartItems(JSON.parse(localCart));
    }
    const localWishlist = localStorage.getItem("aura_wishlist");
    if (localWishlist) {
      setWishlistItems(JSON.parse(localWishlist));
    }
    setIsLoading(false);
  }, []);

  // 2. Sync with database when user status changes to Authenticated
  useEffect(() => {
    if (status === "authenticated") {
      syncCartWithDb();
      fetchWishlistFromDb();
    }
  }, [status]);

  // 3. Save cart to LocalStorage whenever it changes (for backup or guest session)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("aura_cart", JSON.stringify(cartItems));
      localStorage.setItem("aura_wishlist", JSON.stringify(wishlistItems));
    }
  }, [cartItems, wishlistItems, isLoading]);

  // Sync guest cart to DB upon login, or fetch active DB cart
  const syncCartWithDb = async () => {
    try {
      // Get DB cart first
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        
        // If local cart has items, merge them with DB cart
        const localCart = JSON.parse(localStorage.getItem("aura_cart") || "[]");
        if (localCart.length > 0) {
          const merged = mergeCarts(data.items, localCart);
          // Upload merged cart to DB
          await updateDbCart(merged);
        } else {
          setCartItems(data.items || []);
        }
      }
    } catch (error) {
      console.error("Error syncing cart with DB:", error);
    }
  };

  const mergeCarts = (dbItems, localItems) => {
    const merged = [...dbItems];
    localItems.forEach((localItem) => {
      const matchIndex = merged.findIndex(
        (dbItem) =>
          dbItem.product._id === (localItem.product._id || localItem.product) &&
          dbItem.color === localItem.color &&
          dbItem.size === localItem.size
      );
      if (matchIndex > -1) {
        merged[matchIndex].quantity = Math.max(merged[matchIndex].quantity, localItem.quantity);
      } else {
        merged.push(localItem);
      }
    });
    return merged;
  };

  const updateDbCart = async (items) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to update database cart:", err);
    }
  };

  const fetchWishlistFromDb = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.wishlist || []);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  // Add Item to Cart
  const addToCart = (product, quantity, color, size) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          (item.product._id === product._id || item.product === product._id) &&
          item.color === color &&
          item.size === size
      );

      let newItems = [];
      if (existingItemIndex > -1) {
        newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems = [...prevItems, { product, quantity, color, size }];
      }

      if (status === "authenticated") {
        updateDbCart(newItems);
      }
      return newItems;
    });
    toast.success(`${product.title} added to cart`);
  };

  // Remove Item from Cart
  const removeFromCart = (productId, color, size) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter(
        (item) =>
          !(
            (item.product._id === productId || item.product === productId) &&
            item.color === color &&
            item.size === size
          )
      );
      if (status === "authenticated") {
        updateDbCart(newItems);
      }
      return newItems;
    });
    toast.success("Item removed from cart");
  };

  // Update Item Quantity
  const updateQuantity = (productId, color, size, newQty) => {
    if (newQty < 1) return;
    setCartItems((prevItems) => {
      const newItems = prevItems.map((item) => {
        if (
          (item.product._id === productId || item.product === productId) &&
          item.color === color &&
          item.size === size
        ) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      if (status === "authenticated") {
        updateDbCart(newItems);
      }
      return newItems;
    });
  };

  // Clear Cart
  const clearCart = () => {
    setCartItems([]);
    if (status === "authenticated") {
      updateDbCart([]);
    }
    setCoupon(null);
  };

  // Wishlist Actions
  const toggleWishlist = async (productId, productData) => {
    if (status === "authenticated") {
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          const data = await res.json();
          fetchWishlistFromDb();
          toast.success(data.message);
        }
      } catch (err) {
        toast.error("Failed to update wishlist");
      }
    } else {
      // Local toggle for guests
      setWishlistItems((prev) => {
        const index = prev.findIndex((item) => item._id === productId);
        let updated = [];
        if (index > -1) {
          updated = prev.filter((item) => item._id !== productId);
          toast.success("Removed from wishlist");
        } else {
          updated = [...prev, productData];
          toast.success("Added to wishlist");
        }
        return updated;
      });
    }
  };

  // Pricing calculations
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Dynamic shipping: free above 5000, else 150
  const cartShipping = cartSubtotal > 5000 || cartSubtotal === 0 ? 0 : 150;
  
  // Tax: 18% inclusive or exclusive. Let's make it 18% GST of subtotal
  const cartTax = Math.round(cartSubtotal * 0.18);

  // Apply Coupon
  const applyCoupon = async (code) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderValue: cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon");
        return false;
      }
      setCoupon(data.coupon);
      toast.success(`Coupon "${code}" applied successfully`);
      return true;
    } catch (err) {
      toast.error("Failed to validate coupon");
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.success("Coupon removed");
  };

  let cartDiscount = 0;
  if (coupon) {
    if (coupon.type === "percentage") {
      cartDiscount = Math.round(cartSubtotal * (coupon.value / 100));
    } else if (coupon.type === "flat") {
      cartDiscount = coupon.value;
    } else if (coupon.type === "free_shipping") {
      cartDiscount = cartShipping;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal + cartShipping - cartDiscount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        coupon,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartShipping,
        cartTax,
        cartDiscount,
        cartTotal,
      }}
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
