"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  // Pre-fill name/email if authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setValue("name", session.user.name || "");
      setValue("email", session.user.email || "");
    }
  }, [status, session]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.subject,
          category: "General Query",
          message: data.message,
          guestName: data.name,
          guestEmail: data.email,
        }),
      });

      if (res.ok) {
        toast.success("Thank you. Your message has been sent to our support desk.");
        reset({
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          subject: "",
          message: "",
        });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-20">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Support</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide">Contact Us</h1>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            Have questions about our collections, customized sizing, or exchanges? Drop us a line.
          </p>
        </div>

        {/* Contact Info Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT: Info cards */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Atelier Contact</span>
              <h2 className="font-heading text-3xl font-bold tracking-wide">Get In Touch</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our support team is active Monday through Friday, 10:00 AM to 6:00 PM IST. We strive to respond to all inquiries within 24 hours.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 bg-white border border-[#EAE2DC] p-4 rounded-xl shadow-sm">
                <div className="p-2.5 bg-[#FAF6EE] text-camel rounded-full">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="font-bold">Email Inquiries</span>
                  <p className="text-muted-foreground">care@auraluxury.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white border border-[#EAE2DC] p-4 rounded-xl shadow-sm">
                <div className="p-2.5 bg-[#FAF6EE] text-camel rounded-full">
                  <Phone size={16} />
                </div>
                <div>
                  <span className="font-bold">Telephone Support</span>
                  <p className="text-muted-foreground">+91 (11) 4050-8000</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white border border-[#EAE2DC] p-4 rounded-xl shadow-sm">
                <div className="p-2.5 bg-[#FAF6EE] text-camel rounded-full">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="font-bold">The Showroom</span>
                  <p className="text-muted-foreground">DLF Emporio, Vasant Kunj, New Delhi, India</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white border border-[#EAE2DC] p-4 rounded-xl shadow-sm">
                <div className="p-2.5 bg-[#FAF6EE] text-camel rounded-full">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="font-bold">Atelier Hours</span>
                  <p className="text-muted-foreground">Mon - Fri: 10:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form Card */}
          <div className="bg-white border border-[#EAE2DC] p-8 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold pb-2 border-b border-[#EAE2DC] text-left mb-4">
                Send A Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="name" className="text-[10px] uppercase text-muted-foreground font-bold">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Sterling"
                    className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                    disabled={isLoading || status === "authenticated"}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-red-500 font-medium">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="text-[10px] uppercase text-muted-foreground font-bold">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                    disabled={isLoading || status === "authenticated"}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="subject" className="text-[10px] uppercase text-muted-foreground font-bold">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="e.g. Question about size fit"
                  className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                  disabled={isLoading}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="message" className="text-[10px] uppercase text-muted-foreground font-bold">Message Details</Label>
                <Textarea
                  id="message"
                  placeholder="Write details of your query..."
                  rows={5}
                  className="border-[#EAE2DC] text-xs focus:ring-camel focus:border-camel"
                  disabled={isLoading}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-coffee text-white py-3 rounded-md transition-colors flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-xs font-semibold"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Send Message <Send size={12} />
                  </>
                )}
              </Button>
            </form>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}
