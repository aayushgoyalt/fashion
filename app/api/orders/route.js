import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Order from "@/models/Order";

// GET: Fetch order transaction list (Admins retrieve all, customers retrieve their own)
export async function GET(request) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let query = {};
    if (user.role !== "admin") {
      query = { user: user._id };
    }

    const { searchParams } = new URL(request.url);
    const orderStatus = searchParams.get("status") || "";

    if (orderStatus && orderStatus !== "All") {
      query.status = orderStatus;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Orders GET list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
