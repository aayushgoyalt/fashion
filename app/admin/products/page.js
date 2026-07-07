"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  UploadCloud,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const productFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be positive"),
  discountPrice: z.coerce.number().min(0).nullable().optional(),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  gender: z.enum(["Men", "Women", "Unisex"]),
  images: z.array(z.string()).min(1, "At least one product image is required"),
  variants: z
    .array(
      z.object({
        color: z.string().min(1, "Color name is required"),
        colorHex: z.string().min(4, "Hex color code is required"),
        size: z.string().min(1, "Size is required"),
        stock: z.coerce.number().min(0, "Stock cannot be negative"),
      })
    )
    .min(1, "At least one variant is required"),
  careInstructions: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Dialog modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discountPrice: null,
      sku: "",
      category: "",
      gender: "Unisex",
      images: [],
      variants: [{ color: "", colorHex: "#000000", size: "M", stock: 10 }],
      careInstructions: "",
      status: "draft",
      isFeatured: false,
      isBestSeller: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const watchImages = watch("images");

  // Fetch products and categories
  const loadPageData = async () => {
    try {
      const pRes = await fetch("/api/products?status=all");
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData.products || []);
      }

      const cRes = await fetch("/api/categories");
      if (cRes.ok) {
        const cData = await cRes.json();
        setCategories(cData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const openCreateDialog = () => {
    setEditingProduct(null);
    reset({
      title: "",
      description: "",
      price: 0,
      discountPrice: null,
      sku: "",
      category: categories[0]?._id || "",
      gender: "Unisex",
      images: [],
      variants: [{ color: "Camel", colorHex: "#C19A6B", size: "M", stock: 10 }],
      careInstructions: "",
      status: "draft",
      isFeatured: false,
      isBestSeller: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    reset({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || null,
      sku: product.sku,
      category: product.category._id || product.category,
      gender: product.gender,
      images: product.images || [],
      variants: product.variants || [],
      careInstructions: product.careInstructions || "",
      status: product.status,
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
    });
    setIsDialogOpen(true);
  };

  // Image Upload Action Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setValue("images", [...watchImages, data.url]);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      toast.error("Error uploading image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const updated = watchImages.filter((_, i) => i !== index);
    setValue("images", updated);
  };

  // Form Submit Action (handles POST and PUT)
  const onSubmit = async (data) => {
    const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(editingProduct ? "Garment updated" : "Garment created");
        setIsDialogOpen(false);
        loadPageData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save product");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // Delete Action Handler
  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Garment deleted successfully");
        loadPageData();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Header bar */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#EAE2DC] pb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-wide">Garment Catalog</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, update, and manage your inventory garments.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-primary hover:bg-coffee text-white text-xs uppercase font-bold tracking-wider py-3.5 px-6 rounded-xl"
        >
          <Plus size={14} className="mr-2" /> Add Garment
        </Button>
      </div>

      {/* Search Input bar */}
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search products by title or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-[#EAE2DC] rounded-xl text-xs pl-10 focus:ring-camel focus:border-camel"
        />
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Catalog lists render */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-camel" size={32} />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white border border-[#EAE2DC] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#FAF6EE] border-b border-[#EAE2DC] text-muted-foreground font-semibold uppercase tracking-wider text-left">
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Total Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2DC]/50">
                {filteredProducts.map((p) => {
                  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

                  return (
                    <tr key={p._id} className="hover:bg-[#FCFAF7]/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-13 object-cover rounded-lg border border-[#EAE2DC] bg-[#FAF6EE]"
                        />
                        <div className="text-left font-semibold">
                          <span className="block text-primary">{p.title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{p.gender}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-primary">{p.sku}</td>
                      <td className="px-6 py-4">{p.category?.name || "Uncategorized"}</td>
                      <td className="px-6 py-4 font-semibold text-primary">Rs. {p.price}</td>
                      <td className="px-6 py-4 text-center font-bold">{totalStock}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                            p.status === "published" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditDialog(p)}
                            className="p-2 text-primary hover:text-camel hover:bg-[#F8F3F0] rounded-md transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-[#EAE2DC] rounded-2xl text-muted-foreground">
          No products found in the catalog.
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-[#EAE2DC] rounded-2xl font-sans text-primary max-w-3xl overflow-y-auto max-h-[85vh] text-left">
          <DialogHeader className="border-b border-[#EAE2DC] pb-4">
            <DialogTitle className="font-heading text-xl font-bold">
              {editingProduct ? "Edit Catalog Item" : "Add New Garment Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            
            {/* General details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase text-muted-foreground font-bold">Item Title</Label>
                <Input
                  id="title"
                  placeholder="Linen Trench Coat"
                  className="border-[#EAE2DC] text-xs h-10"
                  {...register("title")}
                />
                {errors.title && <p className="text-[10px] text-red-500 font-semibold">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-[10px] uppercase text-muted-foreground font-bold">SKU Code</Label>
                  <Input
                    id="sku"
                    placeholder="AURA-OUT-001"
                    className="border-[#EAE2DC] text-xs h-10 font-bold"
                    {...register("sku")}
                  />
                  {errors.sku && <p className="text-[10px] text-red-500 font-semibold">{errors.sku.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-[10px] uppercase text-muted-foreground font-bold">Category Segment</Label>
                  <select
                    id="gender"
                    className="w-full border border-[#EAE2DC] rounded-md p-2.5 text-xs bg-white h-10"
                    {...register("gender")}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] uppercase text-muted-foreground font-bold">Details Description</Label>
              <Textarea
                id="description"
                placeholder="Product description detailing fabric structure..."
                rows={3}
                className="border-[#EAE2DC] text-xs"
                {...register("description")}
              />
              {errors.description && <p className="text-[10px] text-red-500 font-semibold">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[10px] uppercase text-muted-foreground font-bold">Price (Rs.)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="12999"
                  className="border-[#EAE2DC] text-xs h-10 font-bold"
                  {...register("price")}
                />
                {errors.price && <p className="text-[10px] text-red-500 font-semibold">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice" className="text-[10px] uppercase text-muted-foreground font-bold">Discount Price (Rs.)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  placeholder="10999"
                  className="border-[#EAE2DC] text-xs h-10 font-bold"
                  {...register("discountPrice")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[10px] uppercase text-muted-foreground font-bold">Catalog Collection</Label>
                <select
                  id="category"
                  className="w-full border border-[#EAE2DC] rounded-md p-2.5 text-xs bg-white h-10"
                  {...register("category")}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images Uploader Section */}
            <div className="space-y-3">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Catalog Images</Label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {watchImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] border border-[#EAE2DC] rounded-lg overflow-hidden group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Upload Trigger button */}
                <label className="border border-dashed border-[#EAE2DC] rounded-lg aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-camel transition-colors relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imageUploading ? (
                    <Loader2 size={16} className="animate-spin text-camel" />
                  ) : (
                    <>
                      <UploadCloud size={20} className="text-muted-foreground" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase mt-2">Upload</span>
                    </>
                  )}
                </label>
              </div>
              {errors.images && <p className="text-[10px] text-red-500 font-semibold">{errors.images.message}</p>}
            </div>

            {/* Color/Size Variants Table */}
            <div className="space-y-4 border-t border-[#EAE2DC] pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Color / Size Stock Matrix</Label>
                <Button
                  type="button"
                  onClick={() => append({ color: "Camel", colorHex: "#C19A6B", size: "M", stock: 10 })}
                  variant="outline"
                  size="sm"
                  className="border-[#EAE2DC] text-[9px] uppercase font-bold tracking-wider"
                >
                  Add Variant Row
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="Color Name (e.g. Camel)"
                      className="border-[#EAE2DC] text-xs h-9"
                      {...register(`variants.${idx}.color`)}
                    />
                    <Input
                      type="color"
                      className="w-12 border-[#EAE2DC] h-9 p-0.5"
                      {...register(`variants.${idx}.colorHex`)}
                    />
                    <select
                      className="border border-[#EAE2DC] rounded-md p-2.5 text-xs bg-white h-9"
                      {...register(`variants.${idx}.size`)}
                    >
                      {["XS", "S", "M", "L", "XL", "XXL", "30", "32", "34", "O/S"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      placeholder="Stock count"
                      className="border-[#EAE2DC] text-xs h-9 w-24"
                      {...register(`variants.${idx}.stock`)}
                    />
                    
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.variants && <p className="text-[10px] text-red-500 font-semibold">{errors.variants.message}</p>}
            </div>

            {/* Save details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#EAE2DC] pt-4">
              <div className="space-y-2">
                <Label htmlFor="careInstructions" className="text-[10px] uppercase text-muted-foreground font-bold">Care Instructions</Label>
                <Input
                  id="careInstructions"
                  placeholder="e.g. Hand wash cold, lay flat to dry"
                  className="border-[#EAE2DC] text-xs h-10"
                  {...register("careInstructions")}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[10px] uppercase text-muted-foreground font-bold">Publish State</Label>
                  <select
                    id="status"
                    className="w-full border border-[#EAE2DC] rounded-md p-2.5 text-xs bg-white h-10"
                    {...register("status")}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-3 text-center">
                  <Label htmlFor="isFeatured" className="text-[8px] uppercase tracking-wider font-bold mb-1 block">Featured</Label>
                  <Checkbox
                    id="isFeatured"
                    checked={watch("isFeatured")}
                    onCheckedChange={(checked) => setValue("isFeatured", !!checked)}
                    className="mx-auto"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end pb-3 text-center">
                  <Label htmlFor="isBestSeller" className="text-[8px] uppercase tracking-wider font-bold mb-1 block">Best Seller</Label>
                  <Checkbox
                    id="isBestSeller"
                    checked={watch("isBestSeller")}
                    onCheckedChange={(checked) => setValue("isBestSeller", !!checked)}
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>

            {/* Actions Submit */}
            <div className="border-t border-[#EAE2DC] pt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#EAE2DC] text-xs uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-coffee text-white text-xs uppercase font-bold px-6"
              >
                {editingProduct ? "Update Item" : "Create Item"}
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
