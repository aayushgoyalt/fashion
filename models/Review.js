import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
  author: { type: String, required: true }, // e.g. "Aura Support"
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ReviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // Nullable if posting with name
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    images: [{ type: String }],
    verifiedPurchase: { type: Boolean, default: false },
    replies: [ReplySchema],
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
