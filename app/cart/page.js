"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  Tag,
  X,
  Loader2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    toggleWishlist,
    coupon,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    cartShipping,
    cartTax,
    cartDiscount,
    cartTotal,
    isLoading,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [validating, setValidating] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setValidating(true);
    const success = await applyCoupon(couponCode.toUpperCase().trim());
    if (success) {
      setCouponCode("");
    }
    setValidating(false);
  };

  const handleSaveForLater = (item) => {
    // Add to wishlist
    toggleWishlist(item.product._id || item.product, item.product);
    // Remove from cart
    removeFromCart(item.product._id || item.product, item.color, item.size);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
        <Loader2 className="animate-spin text-camel" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="border-b border-[#EAE2DC] pb-6 mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Your Selection</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">Shopping Bag</h1>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest hover:text-camel font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft size={14} /> Continue Shopping
          </Link>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* LEFT PANEL: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {cartItems.map((item, idx) => {
                  const product = item.product;
                  const itemId = product._id || product;
                  const itemPrice = product.discountPrice || product.price;

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-[#EAE2DC] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="w-24 aspect-[3/4] overflow-hidden rounded-xl bg-[#FAF6EE] flex-shrink-0"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Detail Column */}
                      <div className="flex-1 space-y-2 text-left">
                        <div className="flex justify-between items-start gap-4">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="text-sm font-bold text-primary hover:text-camel transition-colors line-clamp-1">
                              {product.title}
                            </h3>
                          </Link>
                          <span className="text-sm font-bold sm:hidden">
                            Rs. {itemPrice * item.quantity}
                          </span>
                        </div>

                        {/* Variant details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span>Shade: <b className="text-primary font-semibold">{item.color}</b></span>
                          <span>Size: <b className="text-primary font-semibold">{item.size}</b></span>
                        </div>

                        {/* Action triggers */}
                        <div className="flex items-center gap-4 pt-2">
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="text-[10px] text-muted-foreground hover:text-camel font-semibold uppercase flex items-center gap-1 transition-colors"
                          >
                            <Heart size={10} /> Save for later
                          </button>
                          <button
                            onClick={() => removeFromCart(itemId, item.color, item.size)}
                            className="text-[10px] text-red-500 hover:text-red-700 font-semibold uppercase flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={10} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity Select Column */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 sm:gap-2">
                        {/* Mobile Qty Label */}
                        <span className="text-xs text-muted-foreground sm:hidden">Quantity:</span>
                        
                        {/* Qty update buttons */}
                        <div className="flex items-center border border-[#EAE2DC] rounded-md overflow-hidden bg-[#FCFAF7]">
                          <button
                            onClick={() => updateQuantity(itemId, item.color, item.size, item.quantity - 1)}
                            className="px-2.5 py-1 hover:bg-[#F8F3F0] transition-colors text-xs"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemId, item.color, item.size, item.quantity + 1)}
                            className="px-2.5 py-1 hover:bg-[#F8F3F0] transition-colors text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Desktop Item Total price */}
                        <span className="text-xs font-semibold text-primary hidden sm:block">
                          Rs. {itemPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL: Summary Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Order Summary Card */}
              <div className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-xs uppercase tracking-widest font-bold pb-4 border-b border-[#EAE2DC]">
                  Order Summary
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bag Subtotal</span>
                    <span className="font-semibold">Rs. {cartSubtotal}</span>
                  </div>
                  
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> Coupon Discount
                      </span>
                      <span>- Rs. {cartDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST Taxes (18% inclusive)</span>
                    <span className="font-semibold">Rs. {cartTax}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Estimate</span>
                    <span>{cartShipping === 0 ? "Complimentary" : `Rs. ${cartShipping}`}</span>
                  </div>

                  <div className="border-t border-[#EAE2DC] pt-4 flex justify-between items-baseline">
                    <span className="font-bold uppercase tracking-wider text-primary">Estimated Total</span>
                    <span className="text-lg font-bold text-primary">Rs. {cartTotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-primary hover:bg-coffee text-white py-6 rounded-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </Button>
              </div>

              {/* Coupon Application Box */}
              <div className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                  <Tag size={14} className="text-camel" /> Apply Promo Code
                </div>
                
                {coupon ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> {coupon.code} Applied
                    </span>
                    <button onClick={removeCoupon} className="hover:text-green-900">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="WELCOME10 / LUXE2000"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={validating}
                      className="border-[#EAE2DC] uppercase text-xs h-10 focus:ring-camel focus:border-camel flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={validating}
                      className="bg-primary hover:bg-coffee text-white text-xs uppercase font-semibold h-10 px-4"
                    >
                      {validating ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                    </Button>
                  </form>
                )}
              </div>

              {/* Shipping Threshold Badge info */}
              {cartSubtotal < 5000 && (
                <div className="bg-[#FAF6EE] border border-[#EAE2DC] p-4 rounded-xl flex items-center gap-3 text-[11px] leading-normal text-muted-foreground font-medium">
                  <Truck size={16} className="text-camel flex-shrink-0" />
                  <p>
                    Add <span className="font-bold text-primary">Rs. {5000 - cartSubtotal}</span> more to your bag to unlock <span className="font-bold text-camel">Complimentary Express Shipping</span>.
                  </p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-[#EAE2DC] rounded-2xl space-y-6 max-w-xl mx-auto">
            <div className="p-4 bg-[#F8F3F0] w-fit rounded-full mx-auto text-camel">
              <ShoppingBag size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-bold">Your shopping bag is empty</h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Discover our structured outerwear, Belgian linen shirts, and fine Mongolian cashmere knits.
              </p>
            </div>
            <Button
              onClick={() => router.push("/shop")}
              className="bg-primary hover:bg-coffee text-white uppercase text-xs tracking-widest font-semibold px-8 py-5 rounded-md"
            >
              Start Shopping
            </Button>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
