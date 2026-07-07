"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  CreditCard,
  Truck,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    cartItems,
    coupon,
    clearCart,
    cartSubtotal,
    cartShipping,
    cartTax,
    cartDiscount,
    cartTotal,
    isLoading: cartLoading,
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  // Address form fields state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    country: "India",
  });

  // Pre-populate address if user is logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
      fetchUserAddresses();
    }
  }, [status, session]);

  const fetchUserAddresses = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        if (data.savedAddresses && data.savedAddresses.length > 0) {
          setSavedAddresses(data.savedAddresses);
          const defaultIdx = data.savedAddresses.findIndex((a) => a.isDefault);
          setSelectedAddressIndex(defaultIdx > -1 ? defaultIdx : 0);
          
          // Populate form with default
          const addr = data.savedAddresses[defaultIdx > -1 ? defaultIdx : 0];
          setFormData((prev) => ({
            ...prev,
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            phone: addr.phone,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load saved addresses:", err);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddressSelect = (index) => {
    setSelectedAddressIndex(index);
    const addr = savedAddresses[index];
    setFormData((prev) => ({
      ...prev,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      phone: addr.phone,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.street || !formData.city || !formData.state || !formData.postalCode || !formData.phone) {
      toast.error("Please fill in all shipping details");
      return false;
    }
    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  // Main payment execution handler
  const handlePayment = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // 1. Create Razorpay order in our backend
      const orderRes = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartTotal,
          currency: "INR",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Check if we are running in MOCK mode (when Razorpay credentials are placeholder key_id)
      if (orderData.isMock) {
        toast.info("AURA Developer sandbox detected: simulating success...");
        // Call backend verification with mock values to record the order
        const verifyRes = await fetch("/api/checkout/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_signature: "sig_mock",
            shippingAddress: {
              name: formData.name,
              street: formData.street,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
              phone: formData.phone,
            },
            guestEmail: status !== "authenticated" ? formData.email : undefined,
            guestName: status !== "authenticated" ? formData.name : undefined,
            couponId: coupon?._id || undefined,
            cartItems: cartItems.map((item) => ({
              product: item.product._id || item.product,
              title: item.product.title,
              price: item.product.discountPrice || item.product.price,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              image: item.product.images[0],
            })),
            summary: {
              subtotal: cartSubtotal,
              shipping: cartShipping,
              tax: cartTax,
              discount: cartDiscount,
              total: cartTotal,
            },
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          clearCart();
          toast.success("Order placed successfully!");
          router.push(`/track-order?orderId=${verifyData.orderId}`);
        } else {
          throw new Error(verifyData.error || "Mock order validation failed");
        }
        return;
      }

      // 2. Dynamic loading of Razorpay checkout script
      const loadScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isScriptLoaded = await loadScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay script. Check your internet connection.");
        setIsLoading(false);
        return;
      }

      // 3. Configure Razorpay modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AURA Luxury",
        description: "Order Checkout payment",
        order_id: orderData.id,
        handler: async function (response) {
          // Callback after checkout payment success
          try {
            const verifyRes = await fetch("/api/checkout/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress: {
                  name: formData.name,
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  postalCode: formData.postalCode,
                  country: formData.country,
                  phone: formData.phone,
                },
                guestEmail: status !== "authenticated" ? formData.email : undefined,
                guestName: status !== "authenticated" ? formData.name : undefined,
                couponId: coupon?._id || undefined,
                cartItems: cartItems.map((item) => ({
                  product: item.product._id || item.product,
                  title: item.product.title,
                  price: item.product.discountPrice || item.product.price,
                  quantity: item.quantity,
                  color: item.color,
                  size: item.size,
                  image: item.product.images[0],
                })),
                summary: {
                  subtotal: cartSubtotal,
                  shipping: cartShipping,
                  tax: cartTax,
                  discount: cartDiscount,
                  total: cartTotal,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              clearCart();
              toast.success("Order placed successfully!");
              router.push(`/track-order?orderId=${verifyData.orderId}`);
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            toast.error("Error verifying payment signature");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#251D1A",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Checkout payment error:", error);
      toast.error(error.message || "Something went wrong during payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (cartLoading) {
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
        <div className="border-b border-[#EAE2DC] pb-6 mb-8">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Secure Portal</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">Checkout</h1>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* LEFT PANEL: Shipping Details Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Saved Address list for logged in users */}
              {status === "authenticated" && savedAddresses.length > 0 && (
                <div className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-widest font-bold">Saved Address Options</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useSaved"
                        checked={useSavedAddress}
                        onCheckedChange={(checked) => setUseSavedAddress(!!checked)}
                      />
                      <label htmlFor="useSaved" className="text-xs font-semibold cursor-pointer">
                        Use a saved address
                      </label>
                    </div>
                  </div>

                  {useSavedAddress && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedAddresses.map((addr, idx) => (
                        <div
                          key={addr._id}
                          onClick={() => handleAddressSelect(idx)}
                          className={cn(
                            "border p-4 rounded-xl cursor-pointer hover:border-camel transition-colors relative flex flex-col justify-between text-xs space-y-2",
                            selectedAddressIndex === idx ? "border-camel bg-[#FAF6EE]/50 ring-1 ring-camel" : "border-[#EAE2DC]"
                          )}
                        >
                          <div className="space-y-1 text-left">
                            <span className="font-bold block text-primary">{session.user.name}</span>
                            <p className="text-muted-foreground leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                            <span className="text-muted-foreground block">Phone: {addr.phone}</span>
                          </div>
                          {addr.isDefault && (
                            <span className="bg-[#EAE2DC] text-primary text-[8px] font-bold tracking-wider px-2 py-0.5 rounded uppercase self-start">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* General Shipping Address Form */}
              {(!useSavedAddress || status !== "authenticated") && (
                <div className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold pb-2 border-b border-[#EAE2DC] text-left">
                    Shipping Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] uppercase text-muted-foreground font-bold">Recipient Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Alexander Wright"
                        className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] uppercase text-muted-foreground font-bold">Contact Email</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="alexander@domain.com"
                        className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                        disabled={status === "authenticated"} // Lock user email
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-[10px] uppercase text-muted-foreground font-bold">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, building, floor, street number"
                      className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="city" className="text-[10px] uppercase text-muted-foreground font-bold">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New Delhi"
                        className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-[10px] uppercase text-muted-foreground font-bold">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Delhi"
                        className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-[10px] uppercase text-muted-foreground font-bold">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="110001"
                        className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[10px] uppercase text-muted-foreground font-bold">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-[10px] uppercase text-muted-foreground font-bold">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        disabled
                        className="border-[#EAE2DC] text-xs h-10 bg-slate-50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="bg-[#FAF6EE] border border-[#EAE2DC] p-5 rounded-2xl flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Truck size={14} className="text-camel" /> Standard Insured Delivery</span>
                <span className="flex items-center gap-1.5"><Shield size={14} className="text-camel" /> Secure 256-bit encryption</span>
              </div>
            </div>

            {/* RIGHT PANEL: Checkout Summary Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-xs uppercase tracking-widest font-bold pb-4 border-b border-[#EAE2DC]">
                  Payment Summary
                </h3>

                {/* Items preview list */}
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 border-b border-[#EAE2DC] pb-4">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-xs text-left">
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-10 h-13 object-cover rounded-lg border border-[#EAE2DC] bg-[#FAF6EE] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold block text-primary truncate">{item.product.title}</span>
                        <span className="text-muted-foreground text-[10px] uppercase">
                          Qty: {item.quantity} / {item.size} / {item.color}
                        </span>
                      </div>
                      <span className="font-semibold ml-auto flex-shrink-0">
                        Rs. {(item.product.discountPrice || item.product.price) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Prices list */}
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs. {cartSubtotal}</span>
                  </div>

                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Applied Promo Discount</span>
                      <span>- Rs. {cartDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST Taxes</span>
                    <span>Rs. {cartTax}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Rates</span>
                    <span>{cartShipping === 0 ? "Free Express" : `Rs. ${cartShipping}`}</span>
                  </div>

                  <div className="border-t border-[#EAE2DC] pt-4 flex justify-between items-baseline">
                    <span className="font-bold uppercase tracking-wider">Order Total</span>
                    <span className="text-lg font-bold text-primary">Rs. {cartTotal}</span>
                  </div>
                </div>

                {/* Pay Trigger */}
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-coffee text-white py-6 rounded-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Authorizing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} /> Pay With Razorpay
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-[#EAE2DC] rounded-2xl max-w-md mx-auto space-y-4">
            <CheckCircle size={32} className="text-green-600 mx-auto" />
            <h2 className="text-lg font-bold">Checkout is empty</h2>
            <Button onClick={() => router.push("/shop")} className="bg-primary text-white text-xs uppercase">
              Start Shopping
            </Button>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
