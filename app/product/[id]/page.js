"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Share2,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FALLBACK_PRODUCTS = [
  {
    _id: "mock-1",
    title: "Linen Trench Coat",
    slug: "linen-trench-coat",
    description: "An elegant, lightweight trench coat made from 100% Belgian linen. Features a relaxed drape, storm flaps, and a removable waist tie. Designed for transitioning seamlessly between seasons in style.",
    price: 12999,
    discountPrice: 10999,
    sku: "AURA-OUT-001",
    gender: "Women",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=800"
    ],
    variants: [
      { color: "Camel", colorHex: "#C19A6B", size: "S", stock: 10 },
      { color: "Camel", colorHex: "#C19A6B", size: "M", stock: 12 },
      { color: "Camel", colorHex: "#C19A6B", size: "L", stock: 5 },
      { color: "Sand", colorHex: "#E8DCD3", size: "S", stock: 8 },
      { color: "Sand", colorHex: "#E8DCD3", size: "M", stock: 10 }
    ],
    specifications: {
      "Fabric": "100% Belgian Linen",
      "Lining": "Unlined for breathability",
      "Fit": "Relaxed drape",
      "Closure": "Horn buttons"
    },
    careInstructions: "Dry clean only. Warm iron if needed.",
    ratings: 4.8,
    reviewsCount: 1,
  },
  {
    _id: "mock-2",
    title: "Cashmere Cable-Knit Sweater",
    slug: "cashmere-cable-knit-sweater",
    description: "Woven from grade-A Mongolian cashmere, this heavy cable-knit sweater offers warmth. Features a premium crew neck.",
    price: 15999,
    sku: "AURA-KNT-002",
    gender: "Unisex",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800"
    ],
    variants: [{ color: "Ivory", colorHex: "#FAF6EE", size: "M", stock: 8 }],
    specifications: { Fabric: "100% Cashmere" },
    careInstructions: "Hand wash cold.",
    ratings: 4.9,
    reviewsCount: 0,
  }
];

export default function ProductDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { id } = params;

  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gallery view parameters
  const [activeImage, setActiveImage] = useState("");
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  // Selected parameters
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Review submission parameters
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setActiveImage(data.images[0]);
          
          // Pre-select default variant
          if (data.variants && data.variants.length > 0) {
            setSelectedColor(data.variants[0].color);
            setSelectedSize(data.variants[0].size);
          }
        } else {
          // Fallback
          loadFallback();
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        loadFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadFallback = () => {
      const match = FALLBACK_PRODUCTS.find((p) => p.slug === id || p._id === id) || FALLBACK_PRODUCTS[0];
      setProduct(match);
      setActiveImage(match.images[0]);
      if (match.variants && match.variants.length > 0) {
        setSelectedColor(match.variants[0].color);
        setSelectedSize(match.variants[0].size);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch product reviews
  useEffect(() => {
    if (!product) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${product._id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        } else {
          setReviews([
            {
              _id: "r-1",
              userName: "Alexander Sterling",
              rating: 5,
              title: "Exceptional draping & fiber quality",
              comment: "Absolutely gorgeous fit. The Belgian linen feels extremely premium and light. Ideal for layering in transition months.",
              createdAt: "2026-06-20T10:00:00Z"
            }
          ]);
        }
      } catch (err) {
        setReviews([
          {
            _id: "r-1",
            userName: "Alexander Sterling",
            rating: 5,
            title: "Exceptional draping & fiber quality",
            comment: "Absolutely gorgeous fit. The Belgian linen feels extremely premium and light. Ideal for layering in transition months.",
            createdAt: "2026-06-20T10:00:00Z"
          }
        ]);
      }
    };
    fetchReviews();
  }, [product]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
        <Loader2 className="animate-spin text-camel" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF6EE] text-center font-sans">
        <div>
          <AlertCircle size={32} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold">Garment Not Found</h2>
          <Button variant="link" onClick={() => router.push("/shop")}>Return to Shop</Button>
        </div>
      </div>
    );
  }

  // Extract unique colors/sizes from variants
  const colors = Array.from(new Set(product.variants.map((v) => v.color))).map((colName) => {
    return product.variants.find((v) => v.color === colName);
  });

  const sizes = Array.from(
    new Set(product.variants.filter((v) => v.color === selectedColor).map((v) => v.size))
  );

  // Check current stock matching selected attributes
  const currentVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const stockAvailable = currentVariant ? currentVariant.stock : 0;

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  // Zoom Handler
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error("Please select a color and size variant first");
      return;
    }
    if (stockAvailable < 1) {
      toast.error("This variant is currently out of stock");
      return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      toast.error("Please select a color and size variant first");
      return;
    }
    if (stockAvailable < 1) {
      toast.error("This variant is currently out of stock");
      return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
    router.push("/cart");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) {
      toast.error("Please fill in your name and comment.");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
          userName: newName,
        }),
      });

      if (res.ok) {
        toast.success("Thank you for your review. It will be published shortly.");
        // Mock add review locally for instant feedback
        setReviews((prev) => [
          {
            _id: `temp-${Date.now()}`,
            userName: newName,
            rating: newRating,
            comment: newComment,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewComment("");
        setNewName("");
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Generate mock delivery date (e.g. 3-5 days from now)
  const getDeliveryDate = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 3);
    const end = new Date(today);
    end.setDate(today.getDate() + 5);

    const options = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
  };

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-primary font-semibold">{product.title}</span>
        </div>

        {/* Double-Pane Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* LEFT: Zoomable Gallery Pane */}
          <div className="space-y-4">
            {/* Main Stage */}
            <div className="relative aspect-[3/4] border border-[#EAE2DC] rounded-2xl overflow-hidden bg-[#FAF6EE] shadow-sm">
              <img
                src={activeImage}
                alt={product.title}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full object-cover cursor-zoom-in"
              />
              {/* Zoom lens overlay */}
              <div
                className="absolute inset-0 pointer-events-none bg-no-repeat bg-[#FAF6EE] z-20 transition-opacity"
                style={{
                  ...zoomStyle,
                  backgroundSize: "200% 200%",
                }}
              ></div>
            </div>

            {/* Thumbnail Select Carousel */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "w-20 aspect-[3/4] rounded-lg overflow-hidden border bg-[#FAF6EE] flex-shrink-0 transition-all",
                      activeImage === img ? "border-camel ring-1 ring-camel" : "border-[#EAE2DC]"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Buy Box Panel */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
                {product.gender} Apparel
              </span>
              <h1 className="font-heading text-4xl font-bold tracking-wide text-primary">
                {product.title}
              </h1>
              
              {/* Star Rating Row */}
              <div className="flex items-center gap-2">
                <div className="flex text-camel">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(product.ratings) ? "#C19A6B" : "none"}
                      className="stroke-camel"
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-primary">
                  {product.ratings} ({reviews.length} Customer Reviews)
                </span>
              </div>

              {/* Pricing Box */}
              <div className="flex items-baseline gap-4 py-2 border-b border-[#EAE2DC]">
                {product.discountPrice ? (
                  <>
                    <span className="text-2xl font-bold">Rs. {product.discountPrice}</span>
                    <span className="text-sm text-muted-foreground line-through">Rs. {product.price}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">Rs. {product.price}</span>
                )}
              </div>
            </div>

            {/* Product short description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Color Variant Selectors */}
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Select Shade: <span className="text-primary font-semibold">{selectedColor}</span>
              </Label>
              <div className="flex gap-3">
                {colors.map((v) => (
                  <button
                    key={v.color}
                    onClick={() => {
                      setSelectedColor(v.color);
                      // Reset selected size if it's not available in the new color
                      const avSizes = product.variants.filter((item) => item.color === v.color).map(i => i.size);
                      if (!avSizes.includes(selectedSize)) {
                        setSelectedSize(avSizes[0] || "");
                      }
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full border relative flex items-center justify-center",
                      selectedColor === v.color ? "ring-2 ring-camel" : "border-[#EAE2DC]"
                    )}
                    style={{ backgroundColor: v.colorHex }}
                  >
                    {selectedColor === v.color && (
                      <span className="absolute inset-0.5 rounded-full border border-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Variant Selectors */}
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Select Size: <span className="text-primary font-semibold">{selectedSize}</span>
              </Label>
              <div className="flex gap-2">
                {sizes.map((sz) => {
                  const szVariant = product.variants.find(
                    (v) => v.color === selectedColor && v.size === sz
                  );
                  const isOutOfStock = szVariant ? szVariant.stock === 0 : true;

                  return (
                    <button
                      key={sz}
                      onClick={() => !isOutOfStock && setSelectedSize(sz)}
                      disabled={isOutOfStock}
                      className={cn(
                        "border text-xs font-semibold px-4 py-2.5 rounded-md min-w-[50px] transition-all",
                        selectedSize === sz
                          ? "bg-primary border-primary text-white"
                          : "border-[#EAE2DC] hover:border-camel text-primary",
                        isOutOfStock && "opacity-35 cursor-not-allowed line-through hover:border-[#EAE2DC]"
                      )}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buy / Quantity controls */}
            <div className="space-y-4 pt-4 border-t border-[#EAE2DC]">
              
              {/* Stock status indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                {stockAvailable > 0 ? (
                  <>
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-green-600">In Stock ({stockAvailable} left)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-red-500">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Quantity */}
              {stockAvailable > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Qty:</span>
                  <div className="flex items-center border border-[#EAE2DC] rounded-md overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1 hover:bg-[#F8F3F0] transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
                      className="px-3 py-1 hover:bg-[#F8F3F0] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Buy Actions Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={stockAvailable < 1}
                  className="flex-1 bg-white hover:bg-[#F8F3F0] text-primary border border-primary py-6 rounded-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} /> Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={stockAvailable < 1}
                  className="flex-1 bg-primary hover:bg-coffee text-white py-6 rounded-md text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2"
                >
                  Buy Now
                </Button>
                
                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product._id, product)}
                  className={cn(
                    "p-3.5 border border-[#EAE2DC] rounded-md transition-colors",
                    isWishlisted ? "bg-red-50 text-red-500 border-red-200" : "hover:bg-[#F8F3F0] text-primary"
                  )}
                >
                  <Heart size={18} fill={isWishlisted ? "#ef4444" : "none"} />
                </button>
              </div>
            </div>

            {/* Delivery/Shipping details card */}
            <div className="bg-[#FAF6EE] border border-[#EAE2DC] p-5 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-camel" />
                <div>
                  <span className="font-bold">Estimated Delivery:</span>
                  <p className="text-muted-foreground">{getDeliveryDate()} (Complimentary Express)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={16} className="text-camel" />
                <div>
                  <span className="font-bold">14-Day Exchanges & Returns:</span>
                  <p className="text-muted-foreground">Free exchange shipping. Hassle-free pickup service.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-camel" />
                <div>
                  <span className="font-bold">COD Option Available:</span>
                  <p className="text-muted-foreground">Select Cash on Delivery during the checkout step.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product specs, care and sizing Tabs */}
        <div className="mt-20 border-t border-[#EAE2DC] pt-12">
          <Tabs defaultValue="specs" className="max-w-4xl mx-auto font-sans">
            <TabsList className="bg-[#FAF6EE] border border-[#EAE2DC] rounded-lg p-1 w-full justify-between sm:justify-start">
              <TabsTrigger value="specs" className="text-xs py-2 px-6 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="fabric" className="text-xs py-2 px-6 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary">
                Fabric Details
              </TabsTrigger>
              <TabsTrigger value="care" className="text-xs py-2 px-6 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary">
                Care Instructions
              </TabsTrigger>
            </TabsList>
            
            {/* Specs Tab Content */}
            <TabsContent value="specs" className="bg-white border border-[#EAE2DC] rounded-2xl p-6 sm:p-8 mt-4 space-y-4">
              <h3 className="font-heading text-lg font-bold">Garment Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-[#EAE2DC] py-2 text-xs">
                      <span className="text-muted-foreground uppercase tracking-wider">{key}</span>
                      <span className="font-semibold text-right">{val}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between border-b border-[#EAE2DC] py-2 text-xs">
                      <span className="text-muted-foreground uppercase tracking-wider">SKU</span>
                      <span className="font-semibold">{product.sku}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#EAE2DC] py-2 text-xs">
                      <span className="text-muted-foreground uppercase tracking-wider">Tailoring</span>
                      <span className="font-semibold">Bespoke Fit</span>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Fabric Tab Content */}
            <TabsContent value="fabric" className="bg-white border border-[#EAE2DC] rounded-2xl p-6 sm:p-8 mt-4 space-y-3">
              <h3 className="font-heading text-lg font-bold">Material & Origins</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We select and build garments using organically harvested flax (Belgian Linen), and Grade-A fine wool blends sourced from ethical Tuscan mills. The fibers have a natural elasticity, superior breathability, and feel soft against the skin, making them perfect for premium sustainable wardrobe foundations.
              </p>
            </TabsContent>

            {/* Care Tab Content */}
            <TabsContent value="care" className="bg-white border border-[#EAE2DC] rounded-2xl p-6 sm:p-8 mt-4 space-y-3">
              <h3 className="font-heading text-lg font-bold">Fiber Care Instructions</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {product.careInstructions || "To maintain the structure and finish of this garment, we advise dry cleaning only. Store on wide wooden hangers and warm iron inside out when damp."}
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Product reviews & Ratings */}
        <div className="mt-20 border-t border-[#EAE2DC] pt-12 max-w-4xl mx-auto font-sans">
          <h2 className="font-heading text-2xl font-bold tracking-wide text-primary mb-8 text-center sm:text-left">
            Customer Reviews & Ratings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left Col: Star Metrics */}
            <div className="md:col-span-1 bg-[#FAF6EE] border border-[#EAE2DC] p-6 rounded-2xl h-fit text-center space-y-4">
              <span className="text-[10px] tracking-widest font-bold uppercase text-muted-foreground">Rating Summary</span>
              <h3 className="text-5xl font-extrabold font-heading text-primary">{product.ratings}</h3>
              
              <div className="flex justify-center text-camel">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(product.ratings) ? "#C19A6B" : "none"}
                    className="stroke-camel"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Average rating based on {reviews.length} reviews.</p>
            </div>

            {/* Right Col: Reviews List & Submission */}
            <div className="md:col-span-2 space-y-8">
              {/* Form submit review */}
              <form onSubmit={handleReviewSubmit} className="bg-white border border-[#EAE2DC] p-6 rounded-2xl space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold">Write a Review</h4>
                
                {/* Select Rating Stars */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Your Rating:</span>
                  <div className="flex text-camel">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNewRating(val)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={16}
                          fill={val <= newRating ? "#C19A6B" : "none"}
                          className="stroke-camel"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="rev-name" className="text-[10px] uppercase text-muted-foreground font-bold">Your Name</Label>
                    <Input
                      id="rev-name"
                      type="text"
                      placeholder="Jane Wright"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={submittingReview}
                      className="border-[#EAE2DC] text-xs h-9 mt-1 focus:ring-camel focus:border-camel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rev-comment" className="text-[10px] uppercase text-muted-foreground font-bold">Your Review</Label>
                    <Textarea
                      id="rev-comment"
                      placeholder="Share your experience wearing this garment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={submittingReview}
                      className="border-[#EAE2DC] text-xs mt-1 focus:ring-camel focus:border-camel"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-primary hover:bg-coffee text-white text-xs uppercase tracking-wider font-bold py-2 px-6 rounded-full w-fit"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>

              {/* Reviews list render */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev._id} className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary">{rev.userName}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString("en-US")}</span>
                      </div>
                      
                      <div className="flex text-camel">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? "#C19A6B" : "none"}
                            className="stroke-camel"
                          />
                        ))}
                      </div>

                      {rev.title && <h5 className="text-xs font-bold text-primary">{rev.title}</h5>}
                      <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-10">No reviews yet. Be the first to review this garment!</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
