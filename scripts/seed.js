const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is missing.");
  process.exit(1);
}

// Schemas are defined with ES modules in the app.
// For the seed script, we redefine local schemas or import Mongoose directly to avoid ESM node execution complexity.
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
});
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  sku: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  gender: { type: String, enum: ["Men", "Women", "Unisex"], required: true },
  images: [{ type: String, required: true }],
  variants: [{ color: String, colorHex: String, size: String, stock: Number }],
  specifications: { type: Map, of: String },
  careInstructions: { type: String },
  ratings: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  seo: { title: String, description: String, keywords: [String] },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
});
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  author: { type: String, required: true, default: "Aura Editorial" },
  featuredImage: { type: String, required: true },
  readingTime: { type: Number, default: 5 },
  published: { type: Boolean, default: true },
});
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["percentage", "flat", "free_shipping"], required: true },
  value: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  firstOrderOnly: { type: Boolean, default: false },
  minOrderValue: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});
const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

async function seed() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected. Cleaning collections...");

    await Category.deleteMany({});
    await Product.deleteMany({});
    await Blog.deleteMany({});
    await Coupon.deleteMany({});
    await Setting.deleteMany({});

    console.log("Seeding Categories...");
    const categoriesData = [
      { name: "Coats & Jackets", slug: "coats-jackets", description: "Timeless outerwear designed for layering and structure.", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800", isActive: true },
      { name: "Knitwear", slug: "knitwear", description: "Soft cashmere, wool blends, and ribbed cotton knits.", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800", isActive: true },
      { name: "Shirts & Tops", slug: "shirts-tops", description: "Relaxed linen shirts, tailored poplin, and organic cotton tanks.", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800", isActive: true },
      { name: "Pants & Trousers", slug: "pants-trousers", description: "Wide-leg trousers and tailored linen wool pants.", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800", isActive: true },
      { name: "Accessories", slug: "accessories", description: "Handcrafted bags, leather belts, and premium boots.", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800", isActive: true },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${categories.length} categories.`);

    const catOuterwear = categories.find(c => c.slug === "coats-jackets")._id;
    const catKnitwear = categories.find(c => c.slug === "knitwear")._id;
    const catTops = categories.find(c => c.slug === "shirts-tops")._id;
    const catPants = categories.find(c => c.slug === "pants-trousers")._id;
    const catAcc = categories.find(c => c.slug === "accessories")._id;

    console.log("Seeding Products...");
    const productsData = [
      {
        title: "Linen Trench Coat",
        slug: "linen-trench-coat",
        description: "An elegant, lightweight trench coat made from 100% Belgian linen. Features a relaxed drape, storm flaps, and a removable waist tie. Designed for transitioning seamlessly between seasons in style.",
        price: 12999,
        discountPrice: 10999,
        sku: "AURA-OUT-001",
        category: catOuterwear,
        gender: "Women",
        images: [
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800",
          "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=800"
        ],
        variants: [
          { color: "Camel", colorHex: "#C19A6B", size: "S", stock: 12 },
          { color: "Camel", colorHex: "#C19A6B", size: "M", stock: 15 },
          { color: "Camel", colorHex: "#C19A6B", size: "L", stock: 8 },
          { color: "Sand", colorHex: "#E8DCD3", size: "S", stock: 10 },
          { color: "Sand", colorHex: "#E8DCD3", size: "M", stock: 14 }
        ],
        specifications: {
          "Fabric": "100% Belgian Linen",
          "Lining": "Unlined for lightweight breathability",
          "Fit": "Relaxed / Oversized drape",
          "Closure": "Double-breasted horn buttons",
          "Length": "Mid-calf"
        },
        careInstructions: "Dry clean only. Warm iron if needed.",
        ratings: 4.8,
        reviewsCount: 16,
        status: "published",
        isFeatured: true,
        isBestSeller: true,
        seo: {
          title: "Premium Belgian Linen Trench Coat | Aura",
          description: "Shop our luxury Belgian linen trench coat. Classic design with an elegant drape, perfect for transitional layering.",
          keywords: ["linen trench", "luxury coat", "women outerwear", "belgian linen"]
        }
      },
      {
        title: "Cashmere Cable-Knit Sweater",
        slug: "cashmere-cable-knit-sweater",
        description: "Woven from grade-A Mongolian cashmere, this heavy cable-knit sweater offers unparalleled softness and warmth. Features a premium ribbed crew neck, cuffs, and hem. A classic investment piece for cold days.",
        price: 15999,
        sku: "AURA-KNT-002",
        category: catKnitwear,
        gender: "Unisex",
        images: [
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800",
          "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800"
        ],
        variants: [
          { color: "Ivory", colorHex: "#FAF6EE", size: "S", stock: 5 },
          { color: "Ivory", colorHex: "#FAF6EE", size: "M", stock: 10 },
          { color: "Ivory", colorHex: "#FAF6EE", size: "L", stock: 12 },
          { color: "Ivory", colorHex: "#FAF6EE", size: "XL", stock: 6 },
          { color: "Coffee", colorHex: "#3B2F2F", size: "M", stock: 8 },
          { color: "Coffee", colorHex: "#3B2F2F", size: "L", stock: 10 }
        ],
        specifications: {
          "Fabric": "100% Grade-A Mongolian Cashmere",
          "Gauge": "7gg heavy cable knit",
          "Fit": "Regular fit",
          "Neckline": "Ribbed Crew Neck"
        },
        careInstructions: "Hand wash cold with wool detergent. Lay flat to dry. Do not wring.",
        ratings: 4.9,
        reviewsCount: 24,
        status: "published",
        isFeatured: true,
        isBestSeller: true,
        seo: {
          title: "Mongolian Cashmere Cable-Knit Sweater | Aura",
          description: "Experience absolute luxury with our Grade-A Cashmere crew neck cable-knit sweater. Handcrafted comfort.",
          keywords: ["cashmere sweater", "cable knit", "unisex luxury knitwear", "mongolian cashmere"]
        }
      },
      {
        title: "Tailored Linen Shirt",
        slug: "tailored-linen-shirt",
        description: "Crafted from highly breathable organic linen, this relaxed-fit shirt features a sharp band collar, adjustable button cuffs, and a curved hem. Pigment-dyed for a soft, worn-in texture that matches clean tailoring.",
        price: 4999,
        discountPrice: 4299,
        sku: "AURA-SHR-003",
        category: catTops,
        gender: "Men",
        images: [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
          "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800"
        ],
        variants: [
          { color: "Cream", colorHex: "#FFFBF0", size: "M", stock: 18 },
          { color: "Cream", colorHex: "#FFFBF0", size: "L", stock: 20 },
          { color: "Cream", colorHex: "#FFFBF0", size: "XL", stock: 15 },
          { color: "Terracotta", colorHex: "#C26D50", size: "M", stock: 10 },
          { color: "Terracotta", colorHex: "#C26D50", size: "L", stock: 12 }
        ],
        specifications: {
          "Fabric": "100% Organic Linen",
          "Collar": "Band collar",
          "Fit": "Modern Tailored Fit",
          "Cuffs": "Mitred adjustable cuffs"
        },
        careInstructions: "Machine wash cold on gentle cycle. Hang dry. Iron while slightly damp.",
        ratings: 4.6,
        reviewsCount: 32,
        status: "published",
        isFeatured: false,
        isBestSeller: true,
        seo: {
          title: "Men's Tailored Organic Linen Shirt | Aura",
          description: "Shop our minimalist organic linen shirts for men. Soft, breathable, and elegantly tailored for a modern look.",
          keywords: ["linen shirt", "men linen top", "band collar shirt", "organic clothing"]
        }
      },
      {
        title: "Wool-Blend Tailored Pants",
        slug: "wool-blend-tailored-pants",
        description: "Smart wide-leg trousers crafted in a premium virgin wool and viscose blend. Features double-pleated front detailing, buttoned welt pockets at the back, and internal suspender buttons. Fully lined down to the knee.",
        price: 7999,
        sku: "AURA-PAN-004",
        category: catPants,
        gender: "Men",
        images: [
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800"
        ],
        variants: [
          { color: "Dark Charcoal", colorHex: "#1A1A1A", size: "30", stock: 8 },
          { color: "Dark Charcoal", colorHex: "#1A1A1A", size: "32", stock: 14 },
          { color: "Dark Charcoal", colorHex: "#1A1A1A", size: "34", stock: 10 },
          { color: "Chocolate Brown", colorHex: "#4E3629", size: "32", stock: 12 },
          { color: "Chocolate Brown", colorHex: "#4E3629", size: "34", stock: 8 }
        ],
        specifications: {
          "Fabric": "60% Virgin Wool, 40% Viscose",
          "Lining": "100% cupro half-lining",
          "Pleats": "Double pleats",
          "Rise": "Mid-rise",
          "Hem": "Unfinished (allows custom tailoring)"
        },
        careInstructions: "Dry clean only.",
        ratings: 4.7,
        reviewsCount: 19,
        status: "published",
        isFeatured: false,
        isBestSeller: false,
        seo: {
          title: "Tailored Virgin Wool-Blend Trousers | Aura",
          description: "Experience structured drape with Aura's tailored wool-blend trousers. Classic double-pleat design with customizable length.",
          keywords: ["wool pants", "tailored trousers", "pleated pants", "men luxury clothing"]
        }
      },
      {
        title: "Handcrafted Leather Tote",
        slug: "handcrafted-leather-tote",
        description: "An everyday luxury carryall handmade in Tuscany using vegetable-tanned full-grain leather. Designed with a spacious raw-suede interior, an interior zipped brass pocket, and extended shoulder straps for comfort.",
        price: 18999,
        sku: "AURA-ACC-005",
        category: catAcc,
        gender: "Unisex",
        images: [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800"
        ],
        variants: [
          { color: "Coffee", colorHex: "#3B2F2F", size: "O/S", stock: 8 }
        ],
        specifications: {
          "Material": "100% Full-grain Tuscan leather",
          "Tanning": "Vegetable-dyed",
          "Hardware": "Brushed solid brass",
          "Dimensions": "38cm W x 40cm H x 15cm D"
        },
        careInstructions: "Apply leather conditioner once a year. Store in the provided dust bag.",
        ratings: 4.9,
        reviewsCount: 9,
        status: "published",
        isFeatured: true,
        isBestSeller: false,
        seo: {
          title: "Italian Handcrafted Leather Tote Bag | Aura",
          description: "Shop Tuscan vegetable-tanned full-grain leather tote bags. Perfect unisex carryall designed to age beautifully.",
          keywords: ["leather tote", "handcrafted bag", "italian leather", "unisex tote bag"]
        }
      },
      {
        title: "Minimalist Silk Dress",
        slug: "minimalist-silk-dress",
        description: "A premium bias-cut slip dress made from heavy-weight mulberry silk. Suspended on delicate, adjustable spaghetti straps, it cascades to an elegant midi-length hem. The subtle terracotta hue adds a warm glow.",
        price: 14999,
        sku: "AURA-DRS-006",
        category: catTops, // using tops for convenience or general category mapping
        gender: "Women",
        images: [
          "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800"
        ],
        variants: [
          { color: "Terracotta", colorHex: "#C26D50", size: "XS", stock: 6 },
          { color: "Terracotta", colorHex: "#C26D50", size: "S", stock: 10 },
          { color: "Terracotta", colorHex: "#C26D50", size: "M", stock: 12 },
          { color: "Terracotta", colorHex: "#C26D50", size: "L", stock: 5 }
        ],
        specifications: {
          "Fabric": "100% Pure Mulberry Silk (19mm weight)",
          "Cut": "Bias cut for natural stretch",
          "Straps": "Adjustable silk sliders",
          "Length": "Midi"
        },
        careInstructions: "Dry clean or hand wash cold with silk soap. Iron inside out at lowest setting.",
        ratings: 4.8,
        reviewsCount: 14,
        status: "published",
        isFeatured: true,
        isBestSeller: false,
        seo: {
          title: "Mulberry Silk Midi Slip Dress | Aura",
          description: "Graceful bias-cut silk slip dress in luxury terracotta mulberry silk. Elegance defined.",
          keywords: ["silk dress", "mulberry silk slip", "terracotta midi dress", "luxury slip"]
        }
      }
    ];

    const products = await Product.insertMany(productsData);
    console.log(`Seeded ${products.length} products.`);

    console.log("Seeding Blogs...");
    const blogsData = [
      {
        title: "The Art of Slow Fashion: Investing in Quality",
        slug: "art-of-slow-fashion",
        content: "<p>In an era dominated by hyper-speed trends and disposable clothing, the philosophy of slow fashion stands as a return to intentional elegance. True luxury is not defined by novelty, but by the quiet details: the durability of Belgian linen, the warmth of Grade-A cashmere, and the beauty of vegetable-tanned leather that gains character with age.</p><p>Building a minimalist capsule wardrobe begins with selecting quality over quantity. An oversized linen blazer, a heavy cable-knit crewneck, or tailored wide-leg pants are not pieces for a single season, but lifelong companions. When we invest in high-quality materials and artisanal craftsmanship, we reduce waste, celebrate heritage, and establish a personal style that transcending seasons.</p>",
        category: "Style & Editorial",
        tags: ["Slow Fashion", "Capsule Wardrobe", "Luxury Materials"],
        author: "Aura Editorial",
        featuredImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
        readingTime: 4,
        published: true
      },
      {
        title: "Linen vs Cotton: The Definitive Summer Guide",
        slug: "linen-vs-cotton-guide",
        content: "<p>As temperatures rise, the choice of fabric becomes paramount to comfort and styling. Linen and cotton are the twin staples of hot weather, yet they offer distinct tactile experiences and structural shapes.</p><p>Linen, harvested from the flax plant, is celebrated for its structural drape and cooling attributes. It can absorb up to 20% of its weight in moisture before feeling damp, and its loose weave allows heat to escape. While linen wrinkles easily, these crease marks are part of its natural charm. Cotton, on the other hand, is softer, smoother, and holds pressed shapes longer. For relaxed beachside luxury, linen shirts are unmatched; for active city tailoring, cotton-linen hybrids offer the best of both worlds.</p>",
        category: "Fabric Guide",
        tags: ["Belgian Linen", "Summer Styling", "Care Guide"],
        author: "Aura Textile Labs",
        featuredImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
        readingTime: 6,
        published: true
      }
    ];

    const blogs = await Blog.insertMany(blogsData);
    console.log(`Seeded ${blogs.length} blogs.`);

    console.log("Seeding Coupons...");
    const couponsData = [
      {
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        expiryDate: new Date("2027-12-31"),
        usageLimit: 1000,
        usageCount: 0,
        firstOrderOnly: true,
        minOrderValue: 2000,
        active: true
      },
      {
        code: "AURAFREESHIP",
        type: "free_shipping",
        value: 0,
        expiryDate: new Date("2027-12-31"),
        usageLimit: null,
        usageCount: 0,
        firstOrderOnly: false,
        minOrderValue: 5000,
        active: true
      },
      {
        code: "LUXE2000",
        type: "flat",
        value: 2000,
        expiryDate: new Date("2027-12-31"),
        usageLimit: 200,
        usageCount: 0,
        firstOrderOnly: false,
        minOrderValue: 15000,
        active: true
      }
    ];

    const coupons = await Coupon.insertMany(couponsData);
    console.log(`Seeded ${coupons.length} coupons.`);

    console.log("Seeding Homepage Settings...");
    const heroSetting = {
      key: "homepage_hero",
      value: {
        title: "Tailored to Perfection",
        subtitle: "Minimalist silhouettes crafted in pure Belgian linen and grade-A cashmere.",
        ctaText: "Shop the Collection",
        ctaLink: "/shop",
        backgroundImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200",
      }
    };
    await Setting.create(heroSetting);
    console.log("Seeded settings.");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
