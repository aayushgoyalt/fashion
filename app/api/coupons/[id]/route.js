import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Coupon from "@/models/Coupon";

// DELETE: Remove coupon (Admin only)
export async function DELETE(request, { params }) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Coupon DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
