import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";

// GET: Fetch user profile, addresses, and order history
export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Populate user wishlist items
    const dbUser = await User.findById(user._id).populate({
      path: "wishlist",
      model: Product,
      select: "title slug price discountPrice images inStock",
    });

    // Fetch user order history
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        user: {
          _id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          wishlist: dbUser.wishlist || [],
        },
        savedAddresses: dbUser.savedAddresses || [],
        orders: orders || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User GET details error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update profile name or manage shipping addresses
export async function PUT(request) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, name, address, addressId, addresses } = body;

    await connectToDatabase();
    const dbUser = await User.findById(user._id);

    // ACTION: Edit Profile details
    if (action === "update_profile") {
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
      }
      dbUser.name = name.trim();
      await dbUser.save();
      return NextResponse.json({ message: "Profile updated successfully", name: dbUser.name }, { status: 200 });
    }

    // ACTION: Add new shipping address
    if (action === "add_address") {
      const { street, city, state, postalCode, phone, isDefault } = address;
      if (!street || !city || !state || !postalCode || !phone) {
        return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
      }

      // If set as default, remove default flag from other addresses
      if (isDefault) {
        dbUser.savedAddresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      dbUser.savedAddresses.push({
        street,
        city,
        state,
        postalCode,
        phone,
        isDefault: isDefault || dbUser.savedAddresses.length === 0, // auto default first
      });

      await dbUser.save();
      return NextResponse.json({ message: "Address added successfully", savedAddresses: dbUser.savedAddresses }, { status: 201 });
    }

    // ACTION: Delete shipping address
    if (action === "delete_address") {
      if (!addressId) {
        return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
      }
      
      const index = dbUser.savedAddresses.findIndex((a) => a._id.toString() === addressId);
      if (index === -1) {
        return NextResponse.json({ error: "Address not found" }, { status: 404 });
      }

      const wasDefault = dbUser.savedAddresses[index].isDefault;
      dbUser.savedAddresses.splice(index, 1);

      // Reassign default if we deleted default address and others remain
      if (wasDefault && dbUser.savedAddresses.length > 0) {
        dbUser.savedAddresses[0].isDefault = true;
      }

      await dbUser.save();
      return NextResponse.json({ message: "Address removed successfully", savedAddresses: dbUser.savedAddresses }, { status: 200 });
    }

    // ACTION: Set default address
    if (action === "set_default_address") {
      if (!addressId) {
        return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
      }

      dbUser.savedAddresses.forEach((addr) => {
        addr.isDefault = addr._id.toString() === addressId;
      });

      await dbUser.save();
      return NextResponse.json({ message: "Default address updated", savedAddresses: dbUser.savedAddresses }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid request action" }, { status: 400 });
  } catch (error) {
    console.error("User PUT update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
