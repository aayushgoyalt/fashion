import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Order from "@/models/Order";
import mongoose from "mongoose";

// GET: Fetch order details by custom order ID or Mongoose Object ID (Admin/Owner check)
export async function GET(request, { params }) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { orderId: id.toUpperCase().trim() };
    }

    const order = await Order.findOne(query);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership or admin access
    if (user.role !== "admin" && order.user?.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Order details GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update order details/status (Admin only)
export async function PUT(request, { params }) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, statusDescription } = body;

    if (!status) {
      return NextResponse.json({ error: "Order status is required" }, { status: 400 });
    }

    await connectToDatabase();

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { orderId: id.toUpperCase().trim() };
    }

    const order = await Order.findOne(query);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update status and append tracking timeline log
    order.status = status;
    order.timeline.push({
      status,
      description: statusDescription || `Order status updated to: ${status}`,
      date: new Date(),
    });

    await order.save();

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Order update PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
