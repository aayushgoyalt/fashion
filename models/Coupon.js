import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ["percentage", "flat", "free_shipping"], required: true },
    value: { type: Number, required: true, default: 0 }, // percentage discount (e.g. 15 for 15%) or flat discount in Rs.
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // Null means unlimited
    usageCount: { type: Number, required: true, default: 0 },
    firstOrderOnly: { type: Boolean, default: false },
    minOrderValue: { type: Number, default: 0 }, // Minimum amount needed to apply coupon
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
