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
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items structure" }, { status: 400 });
    }

    await connectToDatabase();

    // Map items to schema format
    const formattedItems = items.map((item) => ({
      product: item.product._id || item.product,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    }));

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
