"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Clock,
  CheckCircle,
  Truck,
  Package,
  AlertCircle,
  Eye,
  Edit2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit status modal states
  const [activeOrder, setActiveOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusDescription, setStatusDescription] = useState("");

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openStatusDialog = (order) => {
    setActiveOrder(order);
    setSelectedStatus(order.status);
    setStatusDescription("");
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${activeOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          statusDescription: statusDescription.trim() || `Order status updated to: ${selectedStatus}`,
        }),
      });

      if (res.ok) {
        toast.success(`Order ${activeOrder.orderId} updated to ${selectedStatus}`);
        setActiveOrder(null);
        loadOrders();
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (statusName) => {
    switch (statusName) {
      case "Delivered": return "bg-green-100 text-green-700 border-green-200";
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Confirmed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Shipped": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderId.toLowerCase().includes(search.toLowerCase()) ||
      ord.shippingAddress.name.toLowerCase().includes(search.toLowerCase()) ||
      (ord.guestEmail && ord.guestEmail.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "All" || ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Header bar */}
      <div className="border-b border-[#EAE2DC] pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-wide">Order Fulfilment</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor transaction payments, update shipping tracking numbers, and manage cancellations.
        </p>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Input
            type="text"
            placeholder="Search orders by ID or recipient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[#EAE2DC] rounded-xl text-xs pl-10 focus:ring-camel focus:border-camel w-full"
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto py-1">
          {["All", "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-full border transition-all flex-shrink-0",
                statusFilter === st
                  ? "bg-primary border-primary text-white"
                  : "border-[#EAE2DC] hover:border-camel text-primary"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table lists */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-camel" size={32} />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white border border-[#EAE2DC] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#FAF6EE] border-b border-[#EAE2DC] text-muted-foreground font-semibold uppercase tracking-wider text-left">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Fulfillment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2DC]/50">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#FCFAF7]/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{ord.orderId}</td>
                    <td className="px-6 py-4 text-left">
                      <span className="block font-bold">{ord.shippingAddress.name}</span>
                      <span className="text-[10px] text-muted-foreground">{ord.guestEmail || "Registered Customer"}</span>
                    </td>
                    <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">{ord.items.length} garments</td>
                    <td className="px-6 py-4 font-bold text-primary">Rs. {ord.summary.total}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", getStatusBadgeClass(ord.status))}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => openStatusDialog(ord)}
                        size="sm"
                        variant="outline"
                        className="border-[#EAE2DC] text-[9px] uppercase font-bold tracking-wider hover:bg-[#F8F3F0]"
                      >
                        <Edit2 size={10} className="mr-1" /> Update Fulfillment
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-[#EAE2DC] rounded-2xl text-muted-foreground">
          No orders found matching the filter.
        </div>
      )}

      {/* UPDATE STATUS DIALOG */}
      {activeOrder && (
        <Dialog open={!!activeOrder} onOpenChange={() => setActiveOrder(null)}>
          <DialogContent className="bg-white border-[#EAE2DC] rounded-2xl font-sans text-primary max-w-lg text-left">
            <DialogHeader className="border-b border-[#EAE2DC] pb-4">
              <DialogTitle className="font-heading text-xl font-bold">
                Fulfillment details: {activeOrder.orderId}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateStatus} className="space-y-6 py-4">
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-[10px] uppercase text-muted-foreground font-bold">Fulfillment Status</Label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-[#EAE2DC] rounded-md p-2.5 text-xs bg-white h-10"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Confirmed">Confirmed Paid</option>
                  <option value="Packed">Packed at Showroom</option>
                  <option value="Shipped">Dispatched Courier</option>
                  <option value="Delivered">Delivered Success</option>
                  <option value="Cancelled">Cancelled Order</option>
                  <option value="Returned">Returned Items</option>
                  <option value="Refunded">Refunded Money</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timelineDesc" className="text-[10px] uppercase text-muted-foreground font-bold">
                  Tracking Log description
                </Label>
                <Textarea
                  id="timelineDesc"
                  placeholder="e.g. Shipment dispatched via BlueDart Air tracking AURA-BD-1002"
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  rows={3}
                  className="border-[#EAE2DC] text-xs"
                />
                <span className="text-[10px] text-muted-foreground italic">
                  This message will display directly on the customer order tracking timeline.
                </span>
              </div>

              {/* Action buttons */}
              <div className="border-t border-[#EAE2DC] pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveOrder(null)}
                  className="border-[#EAE2DC] text-xs uppercase"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatingStatus}
                  className="bg-primary hover:bg-coffee text-white text-xs uppercase font-bold px-6"
                >
                  {updatingStatus ? "Saving..." : "Update Fulfillment"}
                </Button>
              </div>

            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
