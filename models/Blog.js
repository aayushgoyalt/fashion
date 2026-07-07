import mongoose from "mongoose";

const BlogCommentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: String, required: true, default: "Aura Editorial" },
    featuredImage: { type: String, required: true },
    readingTime: { type: Number, default: 5 }, // in minutes
    comments: [BlogCommentSchema],
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
