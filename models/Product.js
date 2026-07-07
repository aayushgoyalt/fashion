import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  colorHex: { type: String, required: true },
  size: { type: String, required: true }, // e.g., XS, S, M, L, XL, XXL
  stock: { type: Number, required: true, default: 0, min: 0 },
});

const SEOSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  keywords: [{ type: String }],
});

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    sku: { type: String, required: true, unique: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    gender: { type: String, enum: ["Men", "Women", "Unisex"], required: true },
    images: [{ type: String, required: true }],
    variants: [VariantSchema],
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    careInstructions: { type: String },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    seo: { type: SEOSchema, default: {} },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Search Index configuration or virtual property
ProductSchema.index({ title: "text", description: "text" });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
