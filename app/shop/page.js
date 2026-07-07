"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Grid,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Fallback catalog list
const MOCK_PRODUCTS = [
  { _id: "mock-1", title: "Linen Trench Coat", slug: "linen-trench-coat", price: 12999, discountPrice: 10999, gender: "Women", images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800"], category: { name: "Coats & Jackets", slug: "coats-jackets" }, ratings: 4.8, reviewsCount: 16, variants: [{ color: "Camel", size: "S" }] },
  { _id: "mock-2", title: "Cashmere Cable-Knit Sweater", slug: "cashmere-cable-knit-sweater", price: 15999, gender: "Unisex", images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800"], category: { name: "Knitwear", slug: "knitwear" }, ratings: 4.9, reviewsCount: 24, variants: [{ color: "Ivory", size: "M" }] },
  { _id: "mock-3", title: "Tailored Linen Shirt", slug: "tailored-linen-shirt", price: 4999, discountPrice: 4299, gender: "Men", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800"], category: { name: "Shirts & Tops", slug: "shirts-tops" }, ratings: 4.6, reviewsCount: 32, variants: [{ color: "Cream", size: "L" }] },
  { _id: "mock-4", title: "Handcrafted Leather Tote", slug: "handcrafted-leather-tote", price: 18999, gender: "Unisex", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"], category: { name: "Accessories", slug: "accessories" }, ratings: 4.9, reviewsCount: 9, variants: [{ color: "Coffee", size: "O/S" }] },
  { _id: "mock-5", title: "Minimalist Silk Dress", slug: "minimalist-silk-dress", price: 14999, gender: "Women", images: ["https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800"], category: { name: "Shirts & Tops", slug: "shirts-tops" }, ratings: 4.8, reviewsCount: 14, variants: [{ color: "Terracotta", size: "S" }] },
  { _id: "mock-6", title: "Oversized Linen Blazer", slug: "oversized-linen-blazer", price: 9999, gender: "Women", images: ["https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?q=80&w=800"], category: { name: "Coats & Jackets", slug: "coats-jackets" }, ratings: 4.7, reviewsCount: 21, variants: [{ color: "Ivory", size: "M" }] }
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load URL state
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialGender = searchParams.get("gender") || "All";
  const initialSort = searchParams.get("sort") || "latest";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialMinPrice = parseFloat(searchParams.get("minPrice") || "0");
  const initialMaxPrice = parseFloat(searchParams.get("maxPrice") || "30000");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isGrid, setIsGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);

  // Active filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);
  const [sort, setSort] = useState(initialSort);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Categories fetch failed:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters/sorting/page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Compile URL parameters
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (selectedCategory) params.append("category", selectedCategory);
        if (selectedGender && selectedGender !== "All") params.append("gender", selectedGender);
        if (selectedSize) params.append("size", selectedSize);
        if (selectedColor) params.append("color", selectedColor);
        if (priceRange[0] > 0) params.append("minPrice", priceRange[0]);
        if (priceRange[1] < 30000) params.append("maxPrice", priceRange[1]);
        params.append("sort", sort);
        params.append("page", currentPage);
        params.append("limit", "8");

        // Sync browser address bar
        router.push(`/shop?${params.toString()}`, { scroll: false });

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.totalProducts || 0);
        } else {
          // Fallback to local mockup
          setProducts(MOCK_PRODUCTS);
          setTotalProducts(MOCK_PRODUCTS.length);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to fetch products, falling back:", err);
        setProducts(MOCK_PRODUCTS);
        setTotalProducts(MOCK_PRODUCTS.length);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedGender, selectedSize, selectedColor, priceRange, sort, currentPage, search]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedGender("All");
    setSelectedSize("");
    setSelectedColor("");
    setPriceRange([0, 30000]);
    setSort("latest");
    setCurrentPage(1);
    toast.success("Filters reset to default");
  };

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Title */}
        <div className="border-b border-[#EAE2DC] pb-8 mb-8 text-center sm:text-left space-y-2">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">
            Aura Wardrobe
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide">
            The Catalog
          </h1>
        </div>

        {/* Outer Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-8 bg-white border border-[#EAE2DC] p-6 rounded-2xl h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE2DC]">
              <span className="text-xs uppercase tracking-wider font-bold flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> Filter Catalog
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] text-muted-foreground hover:text-camel font-semibold uppercase flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            {/* Gender Filters */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Category Segments
              </h4>
              <div className="flex flex-wrap gap-2">
                {["All", "Men", "Women", "Unisex"].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setSelectedGender(g);
                      setCurrentPage(1);
                    }}
                    className={`text-xs px-4 py-2 rounded-full border transition-all ${
                      selectedGender === g
                        ? "bg-primary border-primary text-white"
                        : "border-[#EAE2DC] hover:border-camel text-primary"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Collections
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat.slug}
                      checked={selectedCategory === cat.slug}
                      onCheckedChange={() => {
                        setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug);
                        setCurrentPage(1);
                      }}
                    />
                    <label
                      htmlFor={cat.slug}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Garment Sizes
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {["XS", "S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSize(selectedSize === sz ? "" : sz);
                      setCurrentPage(1);
                    }}
                    className={`border text-[10px] font-bold rounded-md py-2 transition-all ${
                      selectedSize === sz
                        ? "bg-primary border-primary text-white"
                        : "border-[#EAE2DC] hover:border-camel text-primary"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Colors
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Camel", hex: "#C19A6B" },
                  { name: "Sand", hex: "#E8DCD3" },
                  { name: "Ivory", hex: "#FAF6EE" },
                  { name: "Cream", hex: "#FFFBF0" },
                  { name: "Terracotta", hex: "#C26D50" },
                  { name: "Coffee", hex: "#3B2F2F" },
                  { name: "Dark Charcoal", hex: "#1A1A1A" },
                ].map((col) => (
                  <button
                    key={col.name}
                    title={col.name}
                    onClick={() => {
                      setSelectedColor(selectedColor === col.name ? "" : col.name);
                      setCurrentPage(1);
                    }}
                    className={`w-6 h-6 rounded-full border relative ${
                      selectedColor === col.name ? "ring-2 ring-camel" : "border-[#EAE2DC]"
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    {selectedColor === col.name && (
                      <span className="absolute inset-0.5 rounded-full border border-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                <span>Price Limit</span>
                <span className="text-camel font-semibold">Rs. {priceRange[0]} - Rs. {priceRange[1]}</span>
              </div>
              <Slider
                defaultValue={[0, 30000]}
                max={30000}
                step={500}
                value={priceRange}
                onValueChange={(val) => {
                  setPriceRange(val);
                  setCurrentPage(1);
                }}
                className="py-2"
              />
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Toolbar (Sorting and View Toggle) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#EAE2DC] px-6 py-4 rounded-2xl gap-4">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-bold text-primary">{products.length}</span> of{" "}
                <span className="font-bold text-primary">{totalProducts}</span> articles
              </p>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Sort by
                  </span>
                  <Select value={sort} onValueChange={(val) => setSort(val)}>
                    <SelectTrigger className="w-[160px] h-9 border-[#EAE2DC] text-xs">
                      <SelectValue placeholder="Latest Arrivals" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#EAE2DC]">
                      <SelectItem value="latest" className="text-xs">Latest Arrivals</SelectItem>
                      <SelectItem value="price_asc" className="text-xs">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc" className="text-xs">Price: High to Low</SelectItem>
                      <SelectItem value="best_selling" className="text-xs">Best Selling</SelectItem>
                      <SelectItem value="popular" className="text-xs">Customer Ratings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-5 w-[1px] bg-[#EAE2DC]"></div>

                {/* View toggles */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsGrid(true)}
                    className={`p-2 rounded-md ${isGrid ? "bg-[#F8F3F0] text-camel" : "text-muted-foreground hover:text-primary"}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setIsGrid(false)}
                    className={`p-2 rounded-md ${!isGrid ? "bg-[#F8F3F0] text-camel" : "text-muted-foreground hover:text-primary"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Grid/List Render */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="w-full aspect-[3/4] rounded-2xl bg-[#EAE2DC]" />
                    <Skeleton className="w-2/3 h-4 bg-[#EAE2DC]" />
                    <Skeleton className="w-1/3 h-4 bg-[#EAE2DC]" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              isGrid ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map((prod) => (
                    <div
                      key={prod._id}
                      className="group flex flex-col sm:flex-row bg-white border border-[#EAE2DC] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 gap-6"
                    >
                      <Link
                        href={`/product/${prod.slug}`}
                        className="w-full sm:w-[180px] aspect-[3/4] overflow-hidden rounded-xl bg-[#FAF6EE] flex-shrink-0 block"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-2">
                          <span className="text-[9px] tracking-widest font-semibold uppercase text-camel">
                            {prod.category?.name || "Apparel"}
                          </span>
                          <Link href={`/product/${prod.slug}`}>
                            <h3 className="font-heading text-lg font-bold hover:text-camel transition-colors">
                              {prod.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-4 pt-4 sm:pt-0">
                          {prod.discountPrice ? (
                            <>
                              <span className="text-base font-bold">Rs. {prod.discountPrice}</span>
                              <span className="text-xs text-muted-foreground line-through">Rs. {prod.price}</span>
                            </>
                          ) : (
                            <span className="text-base font-bold">Rs. {prod.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20 bg-white border border-[#EAE2DC] rounded-2xl space-y-4">
                <p className="text-sm text-muted-foreground">No garments found matching the filters.</p>
                <Button variant="outline" onClick={resetFilters} className="border-[#EAE2DC] text-xs">
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#EAE2DC] rounded-full h-9 w-9"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={`rounded-full h-9 w-9 text-xs ${
                      currentPage === i + 1 ? "bg-primary text-white" : "border-[#EAE2DC]"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#EAE2DC] rounded-full h-9 w-9"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
          <Loader2 className="animate-spin text-camel" size={32} />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
