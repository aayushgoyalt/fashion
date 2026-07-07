"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Loader2, Tag, Percent, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const couponFormSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .toUpperCase(),
  type: z.enum(["percentage", "flat", "free_shipping"]),
  value: z.coerce.number().min(0, "Value must be positive"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  usageLimit: z.coerce
    .number()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  minOrderValue: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: 0,
      expiryDate: "",
      usageLimit: null,
      minOrderValue: 0,
      active: true,
    },
  });

  const watchType = watch("type");

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateDialog = () => {
    reset({
      code: "",
      type: "percentage",
      value: 10,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 30 days
      usageLimit: null,
      minOrderValue: 0,
      active: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setCreating(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(`Coupon "${data.code}" created successfully`);
        setIsDialogOpen(false);
        loadCoupons();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create coupon");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Coupon ${code} removed`);
        loadCoupons();
      } else {
        toast.error("Failed to delete coupon");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case "percentage": return <Percent size={14} />;
      case "flat": return <Tag size={14} />;
      case "free_shipping": return <Truck size={14} />;
      default: return <Tag size={14} />;
    }
  };

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-[#EAE2DC] pb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-wide">Promo Coupons</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage percentage, flat checkout discounts, and free shipping triggers.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-primary hover:bg-coffee text-white text-xs uppercase font-bold tracking-wider py-3.5 px-6 rounded-xl"
        >
          <Plus size={14} className="mr-2" /> Create Coupon
        </Button>
      </div>

      {/* Coupons Table lists */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-camel" size={32} />
        </div>
      ) : coupons.length > 0 ? (
        <div className="bg-white border border-[#EAE2DC] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#FAF6EE] border-b border-[#EAE2DC] text-muted-foreground font-semibold uppercase tracking-wider text-left">
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Discount Value</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-center">Usage Count</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2DC]/50">
                {coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  const isActive = c.active && !isExpired;

                  return (
                    <tr key={c._id} className="hover:bg-[#FCFAF7]/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary text-sm tracking-wide">
                        {c.code}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-1.5 capitalize font-semibold">
                        <span className="p-1 bg-[#FAF6EE] text-camel rounded-full">{getCouponIcon(c.type)}</span>
                        {c.type.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        {c.type === "percentage" ? `${c.value}%` : c.type === "free_shipping" ? "Free Ship" : `Rs. ${c.value}`}
                      </td>
                      <td className={cn("px-6 py-4 font-semibold", isExpired ? "text-red-500" : "text-muted-foreground")}>
                        {new Date(c.expiryDate).toLocaleDateString()} {isExpired && "(Expired)"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {c.usageCount} {c.usageLimit !== null && `/ ${c.usageLimit}`}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                            isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                          )}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
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
          No coupons created yet. Click the button to start adding.
        </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-[#EAE2DC] rounded-2xl font-sans text-primary max-w-md text-left">
          <DialogHeader className="border-b border-[#EAE2DC] pb-4">
            <DialogTitle className="font-heading text-xl font-bold">
              Create Discount Coupon
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-[10px] uppercase text-muted-foreground font-bold">Promo Code</Label>
                <Input
                  id="code"
                  placeholder="LUXE15"
                  className="border-[#EAE2DC] text-xs h-10 font-bold uppercase"
                  {...register("code")}
                />
                {errors.code && <p className="text-[10px] text-red-500 font-semibold">{errors.code.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-[10px] uppercase text-muted-foreground font-bold">Discount Type</Label>
                <select
                  id="type"
                  className="w-full border border-[#EAE2DC] rounded-md p-2.5 text-xs bg-white h-10"
                  {...register("type")}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Cash (Rs.)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value" className="text-[10px] uppercase text-muted-foreground font-bold">
                  {watchType === "percentage" ? "Percentage Value" : watchType === "free_shipping" ? "N/A" : "Cash Value"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="15"
                  disabled={watchType === "free_shipping"}
                  className="border-[#EAE2DC] text-xs h-10 font-bold"
                  {...register("value")}
                />
                {errors.value && <p className="text-[10px] text-red-500 font-semibold">{errors.value.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-[10px] uppercase text-muted-foreground font-bold">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  className="border-[#EAE2DC] text-xs h-10"
                  {...register("expiryDate")}
                />
                {errors.expiryDate && <p className="text-[10px] text-red-500 font-semibold">{errors.expiryDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderValue" className="text-[10px] uppercase text-muted-foreground font-bold">Min Purchase Value</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  placeholder="2000"
                  className="border-[#EAE2DC] text-xs h-10 font-bold"
                  {...register("minOrderValue")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="text-[10px] uppercase text-muted-foreground font-bold">Usage Limit Count</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="Unlimited"
                  className="border-[#EAE2DC] text-xs h-10 font-bold"
                  {...register("usageLimit")}
                />
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
                disabled={creating}
                className="bg-primary hover:bg-coffee text-white text-xs uppercase font-bold px-6"
              >
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
