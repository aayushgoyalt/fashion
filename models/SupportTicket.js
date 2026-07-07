import mongoose from "mongoose";

const TicketMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["customer", "admin"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SupportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, required: true, default: "General Query" }, // e.g., "Order Status", "Return Request", "Feedback"
    message: { type: String, required: true }, // Initial message
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
      index: true,
    },
    messages: [TicketMessageSchema], // Conversation log
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
