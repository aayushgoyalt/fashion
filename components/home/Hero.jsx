"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    // Entrance animations using GSAP
    const ctx = gsap.context(() => {
      // Ken Burns background scale
      gsap.fromTo(
        bgRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.2, ease: "power2.out" }
      );

      // Text stagger reveal
      const tl = gsap.timeline({ delay: 0.4 });
      
      tl.fromTo(
        titleRef.current.children,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
      );

      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      );

      tl.fromTo(
        ctaRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-primary font-sans"
    >
      {/* Background image overlay */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center opacity-0 transition-transform"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(37, 29, 26, 0.4), rgba(37, 29, 26, 0.7)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600')`,
        }}
      ></div>

      {/* Hero content */}
      <div className="relative max-w-5xl mx-auto px-4 text-center text-white z-10 space-y-6 sm:space-y-8">
        <h1
          ref={titleRef}
          className="font-heading text-5xl sm:text-7xl lg:text-8xl tracking-widest font-extrabold leading-tight text-white"
        >
          <span className="block text-[#FAF6EE] opacity-0">TAILORED TO</span>
          <span className="block text-camel italic font-normal tracking-wide opacity-0">PERFECTION</span>
        </h1>

        <p
          ref={subtitleRef}
          className="max-w-xl mx-auto text-sm sm:text-base font-light tracking-widest text-white/80 uppercase font-sans opacity-0"
        >
          Minimalist silhouettes crafted in pure Belgian linen and grade-A cashmere.
        </p>

        <div ref={ctaRef} className="opacity-0">
          <Button
            asChild
            className="bg-white hover:bg-camel text-primary hover:text-white rounded-full px-8 py-6 font-semibold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-camel/20"
          >
            <Link href="/shop" className="flex items-center gap-2">
              Explore The Collection <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Scrolling Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 text-[10px] tracking-widest uppercase">
        <span className="animate-bounce block w-1 h-3 rounded-full bg-white/50"></span>
        Scroll Down
      </div>
    </section>
  );
}
