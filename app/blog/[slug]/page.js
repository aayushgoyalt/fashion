"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Loader2, ChevronLeft, Calendar, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_BLOGS = [
  {
    slug: "art-of-slow-fashion",
    title: "The Art of Slow Fashion: Investing in Quality",
    category: "Style & Editorial",
    content: "<p>In an era dominated by hyper-speed trends and disposable clothing, the philosophy of slow fashion stands as a return to intentional elegance. True luxury is not defined by novelty, but by the quiet details: the durability of Belgian linen, the warmth of Grade-A cashmere, and the beauty of vegetable-tanned leather that gains character with age.</p><p>Building a minimalist capsule wardrobe begins with selecting quality over quantity. An oversized linen blazer, a heavy cable-knit crewneck, or tailored wide-leg pants are not pieces for a single season, but lifelong companions. When we invest in high-quality materials and artisanal craftsmanship, we reduce waste, celebrate heritage, and establish a personal style that transcending seasons.</p>",
    featuredImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
    readingTime: 4,
    createdAt: "2026-07-01T10:00:00Z"
  },
  {
    slug: "linen-vs-cotton-guide",
    title: "Linen vs Cotton: The Definitive Summer Guide",
    category: "Fabric Guide",
    content: "<p>As temperatures rise, the choice of fabric becomes paramount to comfort and styling. Linen and cotton are the twin staples of hot weather, yet they offer distinct tactile experiences and structural shapes.</p><p>Linen, harvested from the flax plant, is celebrated for its structural drape and cooling attributes. It can absorb up to 20% of its weight in moisture before feeling damp, and its loose weave allows heat to escape. While linen wrinkles easily, these crease marks are part of its natural charm. Cotton, on the other hand, is softer, smoother, and holds pressed shapes longer. For relaxed beachside luxury, linen shirts are unmatched; for active city tailoring, cotton-linen hybrids offer the best of both worlds.</p>",
    featuredImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
    readingTime: 6,
    createdAt: "2026-06-25T10:00:00Z"
  }
];

export default function BlogDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { slug } = params;
  const router = useRouter();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        } else {
          loadFallback();
        }
      } catch (err) {
        loadFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadFallback = () => {
      const match = MOCK_BLOGS.find((b) => b.slug === slug);
      setBlog(match || null);
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
        <Loader2 className="animate-spin text-camel" size={32} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF6EE] text-center font-sans">
        <div>
          <AlertCircle size={32} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold">Article Not Found</h2>
          <Button variant="link" onClick={() => router.push("/blog")}>Return to Journal</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
        
        {/* Back button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs text-camel hover:underline font-bold uppercase tracking-wider mb-4"
        >
          <ChevronLeft size={14} /> Back to journal
        </Link>

        {/* Article Headers */}
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
            {blog.category}
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-6 text-[10px] text-muted-foreground uppercase tracking-widest pt-2">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} /> {blog.readingTime} min read
            </span>
          </div>
        </div>

        {/* Feature Hero image */}
        <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-[#EAE2DC] shadow-sm">
          <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        {/* Article content block */}
        <div
          className="prose prose-stone max-w-none text-xs text-muted-foreground leading-relaxed space-y-6 pt-6 border-t border-[#EAE2DC]"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>

      </article>

      <Footer />
    </div>
  );
}
