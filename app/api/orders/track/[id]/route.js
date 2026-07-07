import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

// GET: Publicly retrieve order details by order tracking number (e.g. AURA-2026-1002)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findOne({ orderId: id.toUpperCase().trim() })
      .select("orderId status timeline items shippingAddress summary createdAt");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Order tracking GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
