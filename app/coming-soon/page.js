"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      if (res.ok) {
        toast.success("Thank you for joining the waitlist.");
        setEmail("");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#251D1A] text-white flex flex-col justify-between p-8 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200')`,
        }}
      ></div>

      {/* Header logo */}
      <div className="z-10 text-center sm:text-left">
        <Link href="/" className="font-heading text-3xl tracking-widest font-bold text-white">
          AURA
        </Link>
      </div>

      {/* Center content */}
      <div className="z-10 max-w-xl mx-auto text-center space-y-6 sm:space-y-8 my-auto">
        <span className="text-[10px] tracking-[0.3em] font-bold text-camel uppercase">Digital Showroom</span>
        <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-widest leading-tight text-[#FAF6EE]">
          COMING SOON
        </h1>
        <p className="text-xs text-white/60 leading-relaxed uppercase tracking-widest max-w-md mx-auto">
          We are tailoring our digital experience. Enter your email below to join the priority waitlist and receive invitations to private collection dispatches.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="relative flex-1">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="bg-white/5 border-white/10 text-white placeholder-white/30 text-xs rounded-lg h-12 pl-4 pr-10 focus:ring-camel focus:border-camel w-full"
            />
            <Mail size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-white hover:bg-camel text-primary hover:text-white rounded-lg text-xs font-semibold h-12 px-6 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                Join Waitlist <ArrowRight size={12} />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="z-10 text-center text-[10px] text-white/40 uppercase tracking-widest">
        © {new Date().getFullYear()} AURA. Crafted with ultimate purpose.
      </div>
    </div>
  );
}
