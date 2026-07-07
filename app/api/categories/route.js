import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Category from "@/models/Category";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET: List active categories
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({ isActive: true });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create category (Admin only)
export async function POST(request) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    await connectToDatabase();

    const slug = result.data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 });
    }

    const newCategory = await Category.create({
      ...result.data,
      slug,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Category POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
