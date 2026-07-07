import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import SupportTicket from "@/models/SupportTicket";

// GET: Fetch all support tickets for the current user
export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const tickets = await SupportTicket.find({ user: user._id }).sort({ createdAt: -1 });

    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error("Tickets GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new support ticket (supports both logged-in and guest users)
export async function POST(request) {
  try {
    const user = await getDbUser(); // returns null for guests
    const body = await request.json();
    const { subject, category, message, guestName, guestEmail } = body;

    if (!subject || !category || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve name/email depending on authentication status
    const email = user ? user.email : guestEmail;
    const name = user ? user.name : guestName;

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    await connectToDatabase();

    const newTicket = await SupportTicket.create({
      user: user ? user._id : null,
      name,
      email,
      subject,
      category,
      message,
      status: "Open",
      messages: [],
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error("Ticket POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
