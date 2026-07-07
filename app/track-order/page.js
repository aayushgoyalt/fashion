"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Clock,
  CheckCircle,
  Truck,
  Package,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTrackingDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track/${id.toUpperCase().trim()}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Order not found");
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchTrackingDetails(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) {
      toast.error("Please enter an Order ID");
      return;
    }
    router.push(`/track-order?orderId=${orderIdInput.trim()}`);
  };

  const getStatusIcon = (statusName) => {
    switch (statusName) {
      case "Pending": return <Clock size={18} />;
      case "Confirmed": return <CheckCircle size={18} />;
      case "Packed": return <Package size={18} />;
      case "Shipped": return <Truck size={18} />;
      case "Delivered": return <CheckCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Shipment Tracking</span>
          <h1 className="font-heading text-4xl font-bold tracking-wide">Track Your Order</h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Input the order tracking ID provided in your confirmation receipt.
          </p>
        </div>

        {/* Input box Form */}
        <div className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm max-w-lg mx-auto mb-10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="e.g. AURA-2026-1002"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                disabled={loading}
                className="border-[#EAE2DC] text-xs h-12 pl-4 pr-10 focus:ring-camel focus:border-camel rounded-lg font-bold"
              />
              <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-coffee text-white text-xs uppercase font-bold tracking-wider px-6 h-12 rounded-lg"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Track"}
            </Button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-camel" size={32} />
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-lg mx-auto text-center space-y-3 text-xs">
            <AlertCircle size={24} className="mx-auto" />
            <p className="font-semibold">{error}</p>
            <p className="text-muted-foreground">Verify the tracking order ID is correct and has a format like AURA-2026-1001.</p>
          </div>
        )}

        {/* Order Display layout */}
        {order && !loading && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Visual Timeline Tracking */}
            <div className="bg-white border border-[#EAE2DC] p-8 rounded-2xl shadow-sm text-center space-y-6">
              <div className="flex justify-between items-baseline border-b border-[#EAE2DC] pb-4 flex-wrap gap-2 text-left">
                <div>
                  <span className="text-[10px] tracking-widest font-bold text-camel uppercase">Tracking info</span>
                  <h3 className="font-heading text-xl font-bold text-primary">{order.orderId}</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  Purchased on: {new Date(order.createdAt).toLocaleDateString("en-US")}
                </span>
              </div>

              {/* Status Stepper */}
              <div className="flex justify-between items-center gap-2 overflow-x-auto py-4">
                {["Pending", "Confirmed", "Packed", "Shipped", "Delivered"].map((st, i, arr) => {
                  const statusIndex = arr.indexOf(order.status);
                  const isCompleted = arr.indexOf(st) <= statusIndex;

                  return (
                    <div key={st} className="flex flex-col items-center flex-1 min-w-[70px] relative">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border z-10 transition-colors",
                          isCompleted ? "bg-primary border-primary text-white" : "border-[#EAE2DC] bg-[#FCFAF7] text-muted-foreground"
                        )}
                      >
                        {getStatusIcon(st)}
                      </div>
                      <span className={cn("text-[9px] uppercase tracking-wider font-bold mt-2", isCompleted ? "text-primary" : "text-muted-foreground")}>
                        {st}
                      </span>
                      
                      {/* Connecting line */}
                      {i < arr.length - 1 && (
                        <div
                          className={cn(
                            "absolute h-[2px] top-5 left-[60%] w-[80%] -z-0",
                            arr.indexOf(arr[i + 1]) <= statusIndex ? "bg-primary" : "bg-[#EAE2DC]"
                          )}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address & Items Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Shipping card */}
              <div className="md:col-span-1 bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm text-xs text-left space-y-4">
                <h4 className="font-bold uppercase tracking-wider text-camel border-b border-[#EAE2DC] pb-2">
                  Shipping Destination
                </h4>
                <div className="space-y-1 text-muted-foreground leading-relaxed">
                  <span className="font-bold text-primary block">{order.shippingAddress.name}</span>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                  <span className="block mt-2">Phone: {order.shippingAddress.phone}</span>
                </div>
              </div>

              {/* Items Card */}
              <div className="md:col-span-2 bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm text-xs text-left space-y-4">
                <h4 className="font-bold uppercase tracking-wider text-camel border-b border-[#EAE2DC] pb-2">
                  Purchased Items
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 border-b border-[#EAE2DC]/50 pb-3 last:border-b-0 last:pb-0">
                      <img
                        src={item.image}
                        alt=""
                        className="w-10 h-13 object-cover rounded-lg border border-[#EAE2DC] bg-[#FAF6EE] flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="font-bold block text-primary">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Qty: {item.quantity} / Size: {item.size} / Shade: {item.color}
                        </span>
                      </div>
                      <span className="font-bold">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
          <Loader2 className="animate-spin text-camel" size={32} />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
