import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import SupportTicket from "@/models/SupportTicket";

// POST: Add message/reply to support ticket
export async function POST(request, { params }) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find ticket: must belong to the user, OR if user is admin, allow reply to any ticket
    let query = { _id: id };
    if (user.role !== "admin") {
      query.user = user._id;
    }

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    const sender = user.role === "admin" ? "admin" : "customer";

    ticket.messages.push({
      sender,
      text: text.trim(),
      createdAt: new Date(),
    });

    // Update status based on sender
    if (sender === "customer") {
      ticket.status = "Open"; // Reopen for admin attention
    } else {
      ticket.status = "In Progress";
    }

    await ticket.save();

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error("Ticket message POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
