"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Outerwear Collection",
    slug: "coats-jackets",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800",
    gridSpan: "md:col-span-2 md:row-span-2 h-[320px] md:h-[660px]",
    subtitle: "Structured Silhouettes",
  },
  {
    name: "Fine Knitwear",
    slug: "knitwear",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800",
    gridSpan: "md:col-span-2 md:row-span-1 h-[320px]",
    subtitle: "Grade-A Cashmere & Wool",
  },
  {
    name: "Tailored Shirts",
    slug: "shirts-tops",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800",
    gridSpan: "md:col-span-1 md:row-span-1 h-[320px]",
    subtitle: "Belgian Linen & Silk",
  },
  {
    name: "Luxe Trousers",
    slug: "pants-trousers",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800",
    gridSpan: "md:col-span-1 md:row-span-1 h-[320px]",
    subtitle: "Modern Cuts",
  },
];

export default function FeaturedCategories() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="py-24 bg-[#FAF6EE] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
            Curated Wardrobe
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide text-primary">
            Explore Collections
          </h2>
          <div className="w-16 h-0.5 bg-camel mx-auto"></div>
        </div>

        {/* Asymmetric Masonry Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`relative overflow-hidden group rounded-2xl shadow-sm border border-[#EAE2DC] ${cat.gridSpan}`}
            >
              {/* Zoom image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${cat.image}')` }}
              ></div>

              {/* Tint overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent transition-opacity duration-300"></div>

              {/* Text content card */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-[9px] tracking-widest font-medium uppercase text-camel mb-1">
                  {cat.subtitle}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-semibold tracking-wide">
                  {cat.name}
                </h3>
                
                <div className="h-0 opacity-0 group-hover:h-8 group-hover:opacity-100 transition-all duration-300 mt-2">
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="text-xs font-semibold uppercase tracking-widest text-[#FAF6EE] hover:text-camel flex items-center gap-1"
                  >
                    View Catalog <span className="text-base font-light">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
