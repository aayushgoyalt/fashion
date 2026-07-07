import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Category from "@/models/Category";
import mongoose from "mongoose";

// GET: Fetch category details by ID or Slug
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const category = await Category.findOne(query);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Category GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update category (Admin only)
export async function PUT(request, { params }) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const updatedCategory = await Category.findOneAndUpdate(query, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete category (Admin only)
export async function DELETE(request, { params }) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const deletedCategory = await Category.findOneAndDelete(query);

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
