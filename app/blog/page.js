"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Loader2, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_BLOGS = [
  {
    slug: "art-of-slow-fashion",
    title: "The Art of Slow Fashion: Investing in Quality",
    category: "Style & Editorial",
    content: "In an era dominated by hyper-speed trends and disposable clothing, the philosophy of slow fashion stands as a return to intentional elegance. True luxury is not defined by novelty, but by the quiet details: the durability of Belgian linen, the warmth of Grade-A cashmere, and the beauty of vegetable-tanned leather that gains character with age.",
    featuredImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
    readingTime: 4,
    createdAt: "2026-07-01T10:00:00Z"
  },
  {
    slug: "linen-vs-cotton-guide",
    title: "Linen vs Cotton: The Definitive Summer Guide",
    category: "Fabric Guide",
    content: "As temperatures rise, the choice of fabric becomes paramount to comfort and styling. Linen and cotton are the twin staples of hot weather, yet they offer distinct tactile experiences and structural shapes.",
    featuredImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
    readingTime: 6,
    createdAt: "2026-06-25T10:00:00Z"
  }
];

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        if (res.ok) {
          const data = await res.json();
          if (data.blogs && data.blogs.length > 0) {
            setBlogs(data.blogs);
          } else {
            setBlogs(MOCK_BLOGS);
          }
        } else {
          setBlogs(MOCK_BLOGS);
        }
      } catch (err) {
        setBlogs(MOCK_BLOGS);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header banner */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-20">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">The Journal</span>
          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-wide">Aura Editorial</h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            Explorations in material sourcing, classic silhouettes, and the philosophy of slow tailoring.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full text-left space-y-4 pb-8">
                <Skeleton className="w-full aspect-[16/10] bg-[#EAE2DC]/40" />
                <div className="px-8 pt-4 flex-1 space-y-4">
                  <Skeleton className="w-24 h-4 bg-[#EAE2DC]/40" />
                  <Skeleton className="w-3/4 h-8 bg-[#EAE2DC]/40 rounded-lg" />
                  <Skeleton className="w-full h-16 bg-[#EAE2DC]/40 rounded-lg" />
                  <Skeleton className="w-28 h-4 bg-[#EAE2DC]/40" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            {blogs.map((post) => (
              <div
                key={post.slug}
                className="group cursor-pointer bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full text-left"
              >
                {/* Image top */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF6EE]">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                </div>
                
                {/* Body details */}
                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <span className="text-[9px] tracking-widest font-semibold uppercase text-camel">
                      {post.category}
                    </span>
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="font-heading text-2xl font-bold hover:text-camel transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.content.replace(/<[^>]*>/g, "")} {/* strip tags for preview */}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-muted-foreground uppercase tracking-wider pt-4 border-t border-[#EAE2DC]">
                    <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><BookOpen size={10} /> {post.readingTime} min read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
