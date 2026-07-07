import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

// GET: Retrieve administrator dashboard overview stats
export async function GET() {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();

    // 1. Gather count metrics
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 2. Gather total revenue (sum totals of completed/paid orders)
    const revenuePipeline = await Order.aggregate([
      {
        $match: {
          status: { $nin: ["Cancelled", "Returned"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$summary.total" },
        },
      },
    ]);
    const totalRevenue = revenuePipeline[0]?.total || 0;

    // 3. Compile Monthly Sales Chart Data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlySalesPipeline = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $nin: ["Cancelled", "Returned"] },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$summary.total" },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Map month integers to names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];
    
    // Initialize 6 months structure
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1; // 1-indexed
      const y = d.getFullYear();

      const match = monthlySalesPipeline.find(
        (s) => s._id.month === m && s._id.year === y
      );

      chartData.push({
        name: monthNames[m - 1],
        revenue: match ? match.revenue : 0,
        orders: match ? match.ordersCount : 0,
      });
    }

    // 4. Fetch recent orders list
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
      },
      chartData,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
