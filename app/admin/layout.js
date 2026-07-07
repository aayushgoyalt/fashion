"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  Tag,
  Home,
  Menu,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Security double-check (Middleware handles main protection)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
        <Loader2 className="animate-spin text-camel" size={32} />
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return null; // Don't show admin contents
  }

  const sidebarLinks = [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { href: "/admin/products", label: "Garment Catalog", icon: <ShoppingBag size={16} /> },
    { href: "/admin/orders", label: "Order Fulfilment", icon: <Clock size={16} /> },
    { href: "/admin/coupons", label: "Discounts & Promo", icon: <Tag size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex font-sans text-primary">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#EAE2DC] p-6 space-y-8 flex-shrink-0">
        <div>
          <Link href="/" className="font-heading text-3xl tracking-widest font-bold text-primary block text-left">
            AURA
          </Link>
          <span className="text-[9px] font-bold text-camel uppercase tracking-widest block text-left mt-1">
            Admin Console
          </span>
        </div>

        <nav className="flex-1 space-y-1 text-left">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors",
                pathname === link.href
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-[#F8F3F0]"
              )}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#EAE2DC] pt-4">
          <Link
            href="/"
            className="text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-xl flex items-center gap-3 hover:bg-[#F8F3F0] transition-colors"
          >
            <Home size={16} /> View Storefront
          </Link>
        </div>
      </aside>

      {/* Main content split */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header bar */}
        <header className="lg:hidden bg-white border-b border-[#EAE2DC] p-4 flex items-center justify-between z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2">
            <Menu size={20} />
          </button>
          <span className="font-heading font-bold tracking-widest">AURA ADMIN</span>
          <Link href="/" className="p-2"><Home size={18} /></Link>
        </header>

        {/* Inner page content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)}></div>
          <div className="relative w-64 bg-white h-full p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-left">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading text-2xl tracking-widest font-bold">AURA</span>
                <span className="text-[8px] font-bold text-camel uppercase">Admin</span>
              </div>
              <nav className="flex flex-col space-y-2 text-left">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors",
                      pathname === link.href
                        ? "bg-primary text-white"
                        : "text-primary hover:bg-[#F8F3F0]"
                    )}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t border-[#EAE2DC] pt-4">
              <Link
                href="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-xl flex items-center gap-3 hover:bg-[#F8F3F0]"
              >
                <Home size={16} /> View Storefront
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
