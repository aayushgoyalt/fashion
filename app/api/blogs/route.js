import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Blog from "@/models/Blog";
import { z } from "zod";

const blogFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string().min(2, "Category is required"),
  tags: z.array(z.string()).default([]),
  featuredImage: z.string().min(1, "Featured image URL is required"),
  readingTime: z.number().default(5),
  published: z.boolean().default(true),
});

// GET: Fetch published blogs
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || "published"; // all for admins

    const query = {};
    if (status !== "all") {
      query.published = true;
    }
    if (category) {
      query.category = category;
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("Blogs GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new blog post (Admin only)
export async function POST(request) {
  try {
    const user = await getDbUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const result = blogFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    await connectToDatabase();

    const slug = result.data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json({ error: "Blog with this title already exists" }, { status: 409 });
    }

    const newBlog = await Blog.create({
      ...result.data,
      slug,
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Blog POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
