import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: "India" },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // Hashed password for credentials provider
    name: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    savedAddresses: [AddressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
