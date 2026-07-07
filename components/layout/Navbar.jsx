"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/CartContext";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Grid,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cartItems, wishlistItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor page scroll to add glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch search suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.error("Search suggestion fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchSuggestions(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        isScrolled
          ? "bg-white/80 dark:bg-charcoal/80 backdrop-blur-md border-b border-[#EAE2DC] py-4 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-primary hover:text-camel transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-2xl sm:text-3xl tracking-widest font-bold text-primary hover:text-camel transition-colors"
          >
            AURA
          </Link>

          {/* Desktop Navigation Link Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest text-primary hover:text-camel font-medium transition-colors"
            >
              Shop All
            </Link>
            <Link
              href="/shop?gender=Men"
              className="text-xs uppercase tracking-widest text-primary hover:text-camel font-medium transition-colors"
            >
              Men
            </Link>
            <Link
              href="/shop?gender=Women"
              className="text-xs uppercase tracking-widest text-primary hover:text-camel font-medium transition-colors"
            >
              Women
            </Link>
            <Link
              href="/blog"
              className="text-xs uppercase tracking-widest text-primary hover:text-camel font-medium transition-colors"
            >
              Editorial
            </Link>
            <Link
              href="/about"
              className="text-xs uppercase tracking-widest text-primary hover:text-camel font-medium transition-colors"
            >
              Our Story
            </Link>
          </nav>

          {/* Search Autocomplete Box */}
          <div className="hidden md:block relative flex-1 max-w-sm">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="bg-[#F8F3F0] border-none text-xs rounded-full pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-camel"
                />
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                {isSearching && (
                  <Loader2 size={12} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </form>

            {/* Autocomplete Suggestions Box */}
            {showSearchSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-charcoal border border-[#EAE2DC] rounded-xl shadow-lg overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        href={`/product/${product.slug}`}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#F8F3F0] transition-colors"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-primary">{product.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{product.gender}</p>
                        </div>
                        <span className="ml-auto text-xs font-medium text-camel">
                          Rs. {product.discountPrice || product.price}
                        </span>
                      </Link>
                    ))}
                    <div className="border-t border-[#EAE2DC] px-4 py-2 text-center bg-[#FAF6EE]">
                      <Link
                        href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                        className="text-[10px] uppercase font-bold tracking-widest text-camel"
                      >
                        View all results
                      </Link>
                    </div>
                  </div>
                ) : (
                  !isSearching && (
                    <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                      No products found
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link
              href="/account?tab=wishlist"
              className="relative p-2 text-primary hover:text-camel transition-colors"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-terracotta text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <Link
              href="/cart"
              className="relative p-2 text-primary hover:text-camel transition-colors"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-primary hover:text-camel transition-colors focus:outline-none">
                    <User size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-[#EAE2DC] rounded-xl shadow-md w-48 font-sans">
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#EAE2DC]" />
                  <DropdownMenuItem className="text-xs py-2.5 focus:bg-[#F8F3F0]" asChild>
                    <Link href="/account" className="w-full cursor-pointer flex items-center gap-2">
                      <User size={14} /> Profile Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "admin" && (
                    <DropdownMenuItem className="text-xs py-2.5 focus:bg-[#F8F3F0] font-semibold text-camel" asChild>
                      <Link href="/admin" className="w-full cursor-pointer flex items-center gap-2">
                        <Grid size={14} /> Admin Console
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#EAE2DC]" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-xs py-2.5 focus:bg-[#F8F3F0] text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut size={14} /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/sign-in"
                className="hidden sm:flex items-center text-xs uppercase tracking-widest font-semibold hover:text-camel text-primary transition-colors gap-1.5"
              >
                <User size={16} /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-white dark:bg-charcoal h-full p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading text-2xl tracking-widest font-bold text-primary">AURA</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-primary p-2">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Search Input */}
              <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#F8F3F0] border-none text-xs rounded-full pl-10 pr-4 py-2 w-full focus:ring-1 focus:ring-camel"
                  />
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </form>

              {/* Mobile Links */}
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider text-primary hover:text-camel font-semibold transition-colors"
                >
                  Shop All
                </Link>
                <Link
                  href="/shop?gender=Men"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider text-primary hover:text-camel font-semibold transition-colors"
                >
                  Men's Clothing
                </Link>
                <Link
                  href="/shop?gender=Women"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider text-primary hover:text-camel font-semibold transition-colors"
                >
                  Women's Clothing
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider text-primary hover:text-camel font-semibold transition-colors"
                >
                  Editorial Blog
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider text-primary hover:text-camel font-semibold transition-colors"
                >
                  Brand Philosophy
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider text-primary hover:text-camel font-semibold transition-colors"
                >
                  Contact Us
                </Link>
              </nav>
            </div>

            {/* Mobile Footer Area */}
            <div className="border-t border-[#EAE2DC] pt-6 space-y-4">
              {session ? (
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs font-bold text-primary">{session.user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{session.user.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#EAE2DC] text-xs hover:bg-[#F8F3F0]"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-primary hover:bg-coffee text-white py-3 rounded-md text-center block text-xs uppercase tracking-wider font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
