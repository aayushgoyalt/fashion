"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Mail, Shield, RefreshCw, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Mock newsletter request. Resend can handle this or a route in the backend
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      if (res.ok) {
        toast.success("Thank you for subscribing to Aura.");
        setEmail("");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-primary text-white font-sans pt-16 pb-8 border-t border-primary">
      {/* Premium Trust Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-white/5 rounded-full text-camel">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Complimentary Shipping</h4>
              <p className="text-xs text-white/60 mt-1">Free express delivery on all orders above Rs. 5,000.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-white/5 rounded-full text-camel">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Effortless Returns</h4>
              <p className="text-xs text-white/60 mt-1">Enjoy a 14-day hassle-free exchange and return policy.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-white/5 rounded-full text-camel">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Secure Checkouts</h4>
              <p className="text-xs text-white/60 mt-1">Authenticated payments powered by Razorpay 256-bit encryption.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="font-heading text-4xl tracking-widest font-bold">
              AURA
            </Link>
            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
              We design and construct modern, high-quality luxury garments. Our materials are sustainably sourced and crafted with ultimate precision.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold">Join The Journal</h4>
              <p className="text-xs text-white/40">Subscribe to receive private collection drops and editorial insights.</p>
              <div className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-white/5 border-white/10 text-white placeholder-white/30 text-xs rounded-full pl-4 pr-10 focus:ring-camel focus:border-camel w-full"
                  />
                  <Mail size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-primary hover:bg-camel hover:text-white rounded-full text-xs font-semibold px-6 transition-all uppercase tracking-wider"
                >
                  {isSubmitting ? "..." : "Join"}
                </Button>
              </div>
            </form>
          </div>

          {/* Catalog Columns */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6">Collections</h4>
            <ul className="space-y-3 text-xs text-white/60">
              <li>
                <Link href="/shop" className="hover:text-camel hover:underline transition-colors">Shop All</Link>
              </li>
              <li>
                <Link href="/shop?gender=Men" className="hover:text-camel hover:underline transition-colors">Men's Apparel</Link>
              </li>
              <li>
                <Link href="/shop?gender=Women" className="hover:text-camel hover:underline transition-colors">Women's Apparel</Link>
              </li>
              <li>
                <Link href="/shop?category=knitwear" className="hover:text-camel hover:underline transition-colors">Luxe Knitwear</Link>
              </li>
              <li>
                <Link href="/shop?category=coats-jackets" className="hover:text-camel hover:underline transition-colors">Outerwear</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6">Customer Care</h4>
            <ul className="space-y-3 text-xs text-white/60">
              <li>
                <Link href="/track-order" className="hover:text-camel hover:underline transition-colors">Track Order</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-camel hover:underline transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-camel hover:underline transition-colors">FAQs</Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-camel hover:underline transition-colors">Shipping & Delivery</Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-camel hover:underline transition-colors">Returns & Refunds</Link>
              </li>
            </ul>
          </div>

          {/* Corporate */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-6">The House</h4>
            <ul className="space-y-3 text-xs text-white/60">
              <li>
                <Link href="/about" className="hover:text-camel hover:underline transition-colors">Our Story</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-camel hover:underline transition-colors">Editorial Journal</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-camel hover:underline transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-camel hover:underline transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
        <p>© {new Date().getFullYear()} AURA Luxury Clothing. All Rights Reserved.</p>
        <p className="flex gap-4">
          <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
          <Link href="/terms-conditions" className="hover:underline">Terms</Link>
          <Link href="/shipping-policy" className="hover:underline">Shipping</Link>
        </p>
      </div>
    </footer>
  );
}
