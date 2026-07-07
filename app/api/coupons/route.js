import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Coupon from "@/models/Coupon";
import { z } from "zod";

const couponFormSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
  type: z.enum(["percentage", "flat", "free_shipping"]),
  value: z.number().min(0, "Value must be positive"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  usageLimit: z.number().nullable().optional(),
  minOrderValue: z.number().default(0),
  active: z.boolean().default(true),
});

// GET: Fetch all coupons (Admin only)
export async function GET() {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new discount coupon (Admin only)
export async function POST(request) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = couponFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    await connectToDatabase();

    const existingCoupon = await Coupon.findOne({ code: result.data.code });
    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const newCoupon = await Coupon.create({
      ...result.data,
      expiryDate: new Date(result.data.expiryDate),
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error("Coupon POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
