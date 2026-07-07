import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Blog from "@/models/Blog";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/faqs",
    "/blog",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    await connectToDatabase();

    // Query active items for sitemap urls
    const products = await Product.find({ status: "published" }).select("slug updatedAt");
    const productRoutes = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Query published articles
    const blogs = await Blog.find({ published: true }).select("slug updatedAt");
    const blogRoutes = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes];
  } catch (error) {
    console.warn("Failed to fetch dynamic sitemap routes, returning static rules:", error);
    return staticRoutes;
  }
}
