"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }) {
  const { toggleWishlist, wishlistItems, addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { _id, title, slug, price, discountPrice, images, ratings, reviewsCount, variants } = product;

  // Check if item is wishlisted
  const isWishlisted = wishlistItems.some((item) => item._id === _id);

  // Calculate discount percentage
  const discountPercent = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Quick add default: select first available variant (color/size)
    if (variants && variants.length > 0) {
      const activeVariant = variants.find((v) => v.stock > 0) || variants[0];
      addToCart(product, 1, activeVariant.color, activeVariant.size);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(_id, product);
  };

  return (
    <div
      className="group relative flex flex-col w-full bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Panel */}
      <Link href={`/product/${slug}`} className="relative aspect-[3/4] overflow-hidden bg-[#FAF6EE] block">
        <img
          src={isHovered && images[1] ? images[1] : images[0]}
          alt={title}
          className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-4 top-4 z-10 p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full text-primary hover:text-red-500 shadow-sm transition-all focus:outline-none"
        >
          <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} className={cn(isWishlisted && "text-red-500")} />
        </button>

        {/* Promo Discount Badge */}
        {discountPrice && (
          <span className="absolute left-4 top-4 bg-terracotta text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            -{discountPercent}%
          </span>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute left-0 right-0 bottom-4 px-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <Button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full bg-primary/90 hover:bg-primary backdrop-blur-sm text-white text-xs uppercase tracking-widest font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <ShoppingBag size={12} /> Quick Add
          </Button>
        </div>
      </Link>

      {/* Info details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <Link href={`/product/${slug}`} className="block">
            <h3 className="text-sm font-semibold text-primary group-hover:text-camel transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <div className="flex text-camel">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.round(ratings) ? "#C19A6B" : "none"}
                  className={cn("stroke-camel", i >= Math.round(ratings) && "opacity-35")}
                />
              ))}
            </div>
            <span>({reviewsCount})</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          {discountPrice ? (
            <>
              <span className="text-sm font-bold text-primary">Rs. {discountPrice}</span>
              <span className="text-xs text-muted-foreground line-through">Rs. {price}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-primary">Rs. {price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
