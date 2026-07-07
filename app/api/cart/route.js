import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// Fetch user's cart
export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    let cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      model: Product,
      select: "title slug price discountPrice images variants stock",
    });

    if (!cart) {
      cart = await Cart.create({ user: user._id, items: [] });
    }

    return NextResponse.json({ items: cart.items }, { status: 200 });
  } catch (error) {
    console.error("Cart GET API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Sync/Save user's cart (takes complete items list and overwrites/merges)
export async function POST(request) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await request.json();
    console.log("POST /api/cart received items:", JSON.stringify(items, null, 2));
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items structure" }, { status: 400 });
    }

    await connectToDatabase();

    // Map items to schema format with strict validation and fallbacks
    const formattedItems = items
      .map((item) => {
        if (!item.product) return null;
        
        let productId = null;
        if (typeof item.product === "object") {
          productId = item.product._id || item.product.id;
        } else if (typeof item.product === "string") {
          productId = item.product;
        }

        // Check if resolved product ID is a valid 24-character hex string
        const isValidObjectId = productId && /^[0-9a-fA-F]{24}$/.test(productId);
        if (!isValidObjectId) {
          console.warn("[CART SYNC] Skipping item with invalid product ID:", productId);
          return null;
        }

        return {
          product: productId,
          quantity: Number(item.quantity) || 1,
          color: item.color || "Default",
          size: item.size || "O/S",
        };
      })
      .filter(Boolean);

    let cart = await Cart.findOne({ user: user._id });
    if (cart) {
      cart.items = formattedItems;
      await cart.save();
    } else {
      cart = await Cart.create({ user: user._id, items: formattedItems });
    }

    // Populate and return updated cart
    const updatedCart = await cart.populate({
      path: "items.product",
      model: Product,
      select: "title slug price discountPrice images variants stock",
    });

    return NextResponse.json({ items: updatedCart.items }, { status: 200 });
  } catch (error) {
    console.error("Cart POST API error:", error);
    if (error.name === "ValidationError") {
      console.error("Mongoose ValidationError details:", JSON.stringify(error.errors, null, 2));
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
