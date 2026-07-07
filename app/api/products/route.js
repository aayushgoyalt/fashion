import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be positive"),
  discountPrice: z.number().min(0).nullable().optional(),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(12, "Valid category is required"),
  gender: z.enum(["Men", "Women", "Unisex"]),
  images: z.array(z.string()).min(1, "At least one product image is required"),
  variants: z.array(
    z.object({
      color: z.string(),
      colorHex: z.string(),
      size: z.string(),
      stock: z.number().min(0, "Stock cannot be negative"),
    })
  ).min(1, "At least one variant must be defined"),
  specifications: z.record(z.string()).optional(),
  careInstructions: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
});

// GET: Query products list
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const gender = searchParams.get("gender") || "";
    const size = searchParams.get("size") || "";
    const color = searchParams.get("color") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");
    const sort = searchParams.get("sort") || "latest";
    const status = searchParams.get("status") || "published"; // "all" for admins to fetch draft + published
    const featured = searchParams.get("featured") || "";
    const bestSeller = searchParams.get("bestSeller") || "";

    const query = {};

    // Filter by status
    if (status !== "all") {
      query.status = status;
    }

    // Flags
    if (featured === "true") query.isFeatured = true;
    if (bestSeller === "true") query.isBestSeller = true;

    // Search matches title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Gender
    if (gender && gender !== "All") {
      query.gender = gender;
    }

    // Category
    if (categorySlug) {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return NextResponse.json({ products: [], totalPages: 0, totalProducts: 0, currentPage: page });
      }
    }

    // Size filter
    if (size) {
      query["variants.size"] = size;
    }

    // Color filter
    if (color) {
      query["variants.color"] = color;
    }

    // Price Range query
    query.price = { $gte: minPrice, $lte: maxPrice };

    // Sorting definition
    let sortObj = {};
    if (sort === "price_asc") {
      sortObj = { price: 1 };
    } else if (sort === "price_desc") {
      sortObj = { price: -1 };
    } else if (sort === "best_selling") {
      sortObj = { reviewsCount: -1 };
    } else if (sort === "popular") {
      sortObj = { ratings: -1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      products,
      totalPages,
      totalProducts,
      currentPage: page,
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create product (Admin only)
export async function POST(request) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    await connectToDatabase();

    // Check SKU duplicate
    const existingProduct = await Product.findOne({ sku: result.data.sku });
    if (existingProduct) {
      return NextResponse.json({ error: "Product with this SKU already exists" }, { status: 409 });
    }

    // Generate slug from title
    const slug = result.data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newProduct = await Product.create({
      ...result.data,
      slug,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
