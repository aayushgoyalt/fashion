"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ProductCard from "@/components/product/ProductCard";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Heart, Layers, Send, Sparkles, Star } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Fallback mockup data in case the local database is not connected/seeded yet
const MOCK_PRODUCTS = [
  {
    _id: "mock-1",
    title: "Linen Trench Coat",
    slug: "linen-trench-coat",
    price: 12999,
    discountPrice: 10999,
    gender: "Women",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=800"
    ],
    ratings: 4.8,
    reviewsCount: 16,
    variants: [{ color: "Camel", colorHex: "#C19A6B", size: "M", stock: 10 }],
    isFeatured: true,
  },
  {
    _id: "mock-2",
    title: "Cashmere Cable-Knit Sweater",
    slug: "cashmere-cable-knit-sweater",
    price: 15999,
    gender: "Unisex",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800",
      "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800"
    ],
    ratings: 4.9,
    reviewsCount: 24,
    variants: [{ color: "Ivory", colorHex: "#FAF6EE", size: "L", stock: 15 }],
    isFeatured: true,
  },
  {
    _id: "mock-3",
    title: "Tailored Linen Shirt",
    slug: "tailored-linen-shirt",
    price: 4999,
    discountPrice: 4299,
    gender: "Men",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800"
    ],
    ratings: 4.6,
    reviewsCount: 32,
    variants: [{ color: "Cream", colorHex: "#FFFBF0", size: "M", stock: 12 }],
    isFeatured: false,
  },
  {
    _id: "mock-4",
    title: "Handcrafted Leather Tote",
    slug: "handcrafted-leather-tote",
    price: 18999,
    gender: "Unisex",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800"
    ],
    ratings: 4.9,
    reviewsCount: 9,
    variants: [{ color: "Coffee", colorHex: "#3B2F2F", size: "O/S", stock: 5 }],
    isFeatured: true,
  },
  {
    _id: "mock-5",
    title: "Minimalist Silk Dress",
    slug: "minimalist-silk-dress",
    price: 14999,
    gender: "Women",
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800"
    ],
    ratings: 4.8,
    reviewsCount: 14,
    variants: [{ color: "Terracotta", colorHex: "#C26D50", size: "S", stock: 8 }],
    isFeatured: true,
  },
  {
    _id: "mock-6",
    title: "Oversized Linen Blazer",
    slug: "oversized-linen-blazer",
    price: 9999,
    gender: "Women",
    images: [
      "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?q=80&w=800"
    ],
    ratings: 4.7,
    reviewsCount: 21,
    variants: [{ color: "Ivory", colorHex: "#FAF6EE", size: "M", stock: 11 }],
    isFeatured: false,
  }
];

const MOCK_BLOGS = [
  {
    slug: "art-of-slow-fashion",
    title: "The Art of Slow Fashion: Investing in Quality",
    category: "Style & Editorial",
    featuredImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
    readingTime: 4,
    date: "July 01, 2026",
  },
  {
    slug: "linen-vs-cotton-guide",
    title: "Linen vs Cotton: The Definitive Summer Guide",
    category: "Fabric Guide",
    featuredImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
    readingTime: 6,
    date: "June 25, 2026",
  }
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    // Attempt DB API fetches
    const fetchHomeData = async () => {
      try {
        const pRes = await fetch("/api/products?limit=6");
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.products && pData.products.length > 0) {
            setFeaturedProducts(pData.products.filter(p => p.isFeatured));
            setBestSellers(pData.products.filter(p => p.isBestSeller || !p.isFeatured));
          } else {
            // Load mock fallback
            setFeaturedProducts(MOCK_PRODUCTS.filter(p => p.isFeatured));
            setBestSellers(MOCK_PRODUCTS.filter(p => !p.isFeatured));
          }
        } else {
          setFeaturedProducts(MOCK_PRODUCTS.filter(p => p.isFeatured));
          setBestSellers(MOCK_PRODUCTS.filter(p => !p.isFeatured));
        }

        const bRes = await fetch("/api/blogs?limit=2");
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData.blogs && bData.blogs.length > 0) {
            setBlogs(bData.blogs);
          } else {
            setBlogs(MOCK_BLOGS);
          }
        } else {
          setBlogs(MOCK_BLOGS);
        }
      } catch (err) {
        console.error("Home API fetch error, utilizing fallback mockups:", err);
        setFeaturedProducts(MOCK_PRODUCTS.filter(p => p.isFeatured));
        setBestSellers(MOCK_PRODUCTS.filter(p => !p.isFeatured));
        setBlogs(MOCK_BLOGS);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans">
      <Navbar />
      <Hero />
      <FeaturedCategories />

      {/* Featured Products Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-3">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
              The Edit
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">
              Featured Pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-semibold hover:text-camel flex items-center gap-1.5 transition-colors border-b border-primary pb-1 self-start md:self-auto"
          >
            Shop The Collection <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.slice(0, 3).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="relative bg-[#251D1A] text-white py-24 px-4 overflow-hidden border-t border-b border-[#251D1A]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200')`,
          }}
        ></div>
        <div className="relative max-w-5xl mx-auto text-center space-y-6 z-10">
          <span className="text-[10px] tracking-[0.3em] font-bold text-camel uppercase">
            Exclusive Summer Event
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-widest text-[#FAF6EE]">
            PRIVATE CARD DISCOUNTS
          </h2>
          <p className="max-w-md mx-auto text-xs text-white/60 uppercase tracking-widest leading-relaxed">
            Enter code <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">LUXE2000</span> at checkout to receive flat Rs. 2,000 off orders exceeding Rs. 15,000.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-white hover:bg-camel text-primary hover:text-white rounded-full px-8 py-5 text-xs font-semibold uppercase tracking-widest transition-all h-auto"
              )}
            >
              Access The Private Sale
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
            Trending Now
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">
            Our Best Sellers
          </h2>
          <div className="w-12 h-0.5 bg-camel mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Story (Why Choose Us) */}
      <section className="bg-[#FAF6EE] py-24 border-t border-b border-[#EAE2DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
              Brand Philosophy
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide text-primary">
              Crafted For The Conscious Curator
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At AURA, we believe in the beauty of simplicity and durability. We reject speed-driven fashion cycles, choosing instead to design structured silhouettes and timeless essentials using only biological linen, pure Italian wools, and organic grade-A cashmere.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every detail is mapped with ultimate precision: from our raw-edge hems to solid brass closures, ensuring that each garment is not just an item of clothing, but a lifelong investment.
            </p>
            <div className="pt-4 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-camel shadow-sm"><Sparkles size={16} /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Premium Fibers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-camel shadow-sm"><Layers size={16} /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Slow Production</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-camel shadow-sm"><Compass size={16} /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Ethical Sourcing</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-[#EAE2DC]">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800"
              alt="Tailoring craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">
            Customer Reflections
          </h2>
          <div className="w-12 h-0.5 bg-camel mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sophia Sterling",
              text: "The Linen Trench Coat has become my everyday layering choice. The drape is incredibly structured yet fluid. It matches the quality of high-end European labels.",
              rating: 5,
            },
            {
              name: "Liam Thorne",
              text: "AURA's cashmere knitwear is outstandingly warm and holds its shape perfectly after washing. True slow fashion.",
              rating: 5,
            },
            {
              name: "Amara Vance",
              text: "The Italian leather tote is a work of art. The solid brass details and raw-suede lining make it look extremely luxurious. Truly satisfied.",
              rating: 5,
            }
          ].map((t, i) => (
            <div key={i} className="bg-white border border-[#EAE2DC] p-8 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex text-camel">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={14} fill="#C19A6B" className="stroke-camel" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">— {t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Blog Journal */}
      <section className="bg-[#FAF6EE] py-24 border-t border-[#EAE2DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
                The Journal
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">
                Editorial & Insights
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs uppercase tracking-widest font-semibold hover:text-camel flex items-center gap-1.5 transition-colors border-b border-primary pb-1"
            >
              Read Journal <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.slice(0, 2).map((post, idx) => (
              <div
                key={idx}
                className="group cursor-pointer bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row h-full"
              >
                <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden bg-[#FAF6EE]">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] tracking-widest font-semibold uppercase text-camel">
                      {post.category}
                    </span>
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3 className="font-heading text-lg font-bold text-primary hover:text-camel transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider pt-2 border-t border-[#EAE2DC]">
                    <span>{post.date || "July 2026"}</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
