import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  color: { type: String, required: true },
  size: { type: String, required: true },
  image: { type: String, required: true },
});

const OrderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
});

const OrderAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: "India" },
  phone: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true }, // Custom order ID e.g., AURA-2026-1001
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // Nullable for guest checkouts
    guestEmail: { type: String },
    guestName: { type: String },
    items: [OrderItemSchema],
    shippingAddress: OrderAddressSchema,
    paymentDetails: {
      provider: { type: String, default: "Razorpay" },
      orderId: { type: String }, // Razorpay Order ID
      paymentId: { type: String }, // Razorpay Payment ID
      status: { type: String, default: "Pending" },
      method: { type: String },
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Returned", "Refunded"],
      default: "Pending",
      index: true,
    },
    timeline: [OrderTimelineSchema],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    summary: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true, default: 0 },
      tax: { type: Number, required: true, default: 0 },
      discount: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
