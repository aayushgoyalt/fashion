"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  ShoppingBag,
  Package,
  Users,
  Loader2,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-camel" size={24} />
      </div>
    );
  }

  const { metrics, chartData = [], recentOrders = [] } = stats || {
    metrics: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 },
    chartData: [],
    recentOrders: []
  };

  // Find max revenue in chart data to scale CSS bar graphs
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 10000);

  return (
    <div className="space-y-10 text-left">
      {/* Top Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-wide">Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time summary of sales activity, catalog volume, and customers metrics.
        </p>
      </div>

      {/* Grid of metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Revenue",
            val: `Rs. ${metrics.totalRevenue.toLocaleString()}`,
            icon: <DollarSign size={18} />,
            color: "text-green-600 bg-green-50 border-green-100",
          },
          {
            label: "Total Orders",
            val: metrics.totalOrders,
            icon: <ShoppingBag size={18} />,
            color: "text-blue-600 bg-blue-50 border-blue-100",
          },
          {
            label: "Active Catalog",
            val: `${metrics.totalProducts} items`,
            icon: <Package size={18} />,
            color: "text-camel bg-[#FAF6EE] border-camel/20",
          },
          {
            label: "Retail Customers",
            val: `${metrics.totalCustomers} users`,
            icon: <Users size={18} />,
            color: "text-purple-600 bg-purple-50 border-purple-100",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                {card.label}
              </span>
              <h3 className="text-xl font-bold font-heading">{card.val}</h3>
            </div>
            <div className={cn("p-3 rounded-full border", card.color)}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Chart & Recent activity split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly sales chart (Pure CSS Bar graph) */}
        <div className="lg:col-span-2 bg-white border border-[#EAE2DC] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAE2DC] pb-4">
            <span className="text-xs uppercase tracking-widest font-bold flex items-center gap-1.5">
              <TrendingUp size={14} className="text-camel" /> Monthly Revenue Trend
            </span>
          </div>

          <div className="h-[220px] flex items-end justify-between gap-4 pt-6">
            {chartData.map((data, idx) => {
              // Calculate relative height percentage
              const percentHeight = (data.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Hover tooltip value */}
                  <span className="absolute bottom-[105%] bg-primary text-white text-[9px] font-semibold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Rs. {data.revenue.toLocaleString()}
                  </span>
                  
                  {/* Solid styled bar */}
                  <div
                    className="w-full bg-primary/10 group-hover:bg-camel rounded-t-lg transition-all duration-500 ease-out"
                    style={{ height: `${Math.max(4, percentHeight)}%` }}
                  ></div>
                  
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mt-3">
                    {data.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent orders panel */}
        <div className="lg:col-span-1 bg-white border border-[#EAE2DC] p-6 rounded-2xl shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#EAE2DC] pb-4">
              <span className="text-xs uppercase tracking-widest font-bold">Recent Fulfilments</span>
            </div>

            <div className="space-y-4 text-xs">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord) => (
                  <div key={ord._id} className="flex justify-between items-center py-1 border-b border-[#EAE2DC]/50 last:border-b-0">
                    <div className="space-y-0.5 text-left">
                      <span className="font-bold text-primary block">{ord.orderId}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {ord.guestEmail || "Member Account"}
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="font-bold block">Rs. {ord.summary.total}</span>
                      <span
                        className={cn(
                          "text-[8px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full",
                          ord.status === "Delivered" && "bg-green-100 text-green-700",
                          ord.status === "Pending" && "bg-yellow-100 text-yellow-700",
                          ord.status === "Confirmed" && "bg-blue-100 text-blue-700"
                        )}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-10">No orders logged yet.</p>
              )}
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="text-[10px] uppercase tracking-widest font-bold text-camel hover:text-primary flex items-center gap-1 mt-4 transition-colors justify-center"
          >
            Manage Fulfilment <ArrowRight size={10} />
          </Link>
        </div>

      </div>
    </div>
  );
}
