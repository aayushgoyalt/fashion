import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(request) {
  try {
    const { code, orderValue } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    await connectToDatabase();

    const cleanCode = code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    // Expiry check
    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Usage limits check
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon's usage limit has been reached" }, { status: 400 });
    }

    // Minimum value check
    if (orderValue < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `A minimum purchase of Rs. ${coupon.minOrderValue} is required to apply this coupon` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
