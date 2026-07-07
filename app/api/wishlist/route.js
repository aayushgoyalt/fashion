import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

// Get user's wishlist
export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch and populate wishlist
    const userWithWishlist = await User.findById(user._id).populate({
      path: "wishlist",
      model: Product,
      select: "title slug price discountPrice images inStock ratings reviewsCount",
    });

    return NextResponse.json({ wishlist: userWithWishlist.wishlist || [] }, { status: 200 });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Toggle wishlist item (Add if not present, remove if present)
export async function POST(request) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const dbUser = await User.findById(user._id);
    const index = dbUser.wishlist.indexOf(productId);
    
    let added = false;
    if (index > -1) {
      // Already exists, remove it
      dbUser.wishlist.splice(index, 1);
    } else {
      // Add it
      dbUser.wishlist.push(productId);
      added = true;
    }

    await dbUser.save();

    return NextResponse.json({ added, message: added ? "Added to wishlist" : "Removed from wishlist" }, { status: 200 });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
