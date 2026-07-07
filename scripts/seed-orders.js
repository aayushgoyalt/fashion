const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing.");
  process.exit(1);
}

// Inline schemas for standalone node execution
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  discountPrice: Number,
  images: [String],
});
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      title: String,
      price: Number,
      quantity: Number,
      color: String,
      size: String,
      image: String,
    }
  ],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  paymentDetails: {
    provider: String,
    orderId: String,
    paymentId: String,
    status: String,
    method: String,
  },
  status: String,
  timeline: [
    {
      status: String,
      description: String,
      date: { type: Date, default: Date.now },
    }
  ],
  summary: {
    subtotal: Number,
    shipping: Number,
    tax: Number,
    discount: Number,
    total: Number,
  },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function seedOrders() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // Clean existing orders
    await Order.deleteMany({});
    console.log("Deleted old orders.");

    // Fetch user and products
    const user = await User.findOne({ email: "aayushgoyaldps@gmail.com" });
    if (!user) {
      console.error("Could not find user aayushgoyaldps@gmail.com. Please run after signing up this user.");
      process.exit(1);
    }

    const products = await Product.find({});
    if (products.length === 0) {
      console.error("No products found. Please seed products first using `node scripts/seed.js`.");
      process.exit(1);
    }

    console.log(`Found user: ${user.name} and ${products.length} products.`);

    const orderStatuses = ["Confirmed", "Shipped", "Delivered", "Delivered", "Delivered"];
    const shippingStates = ["Delhi", "Maharashtra", "Karnataka", "Haryana", "Uttar Pradesh"];
    const shippingCities = ["New Delhi", "Mumbai", "Bengaluru", "Gurugram", "Noida"];

    const mockOrders = [];
    const now = new Date();

    // Generate 12 orders over the last 5 months
    for (let i = 1; i <= 12; i++) {
      const orderDate = new Date();
      // Distribute dates back: 3 orders in current month, 2 in last month, 2 in 2 months ago, 3 in 3 months ago, 2 in 4 months ago
      const monthsAgo = Math.floor((i - 1) / 2.5);
      orderDate.setMonth(now.getMonth() - monthsAgo);
      orderDate.setDate(Math.max(1, Math.min(28, Math.floor(Math.random() * 28) + 1)));

      const orderId = `AURA-2026-${1000 + i}`;
      const status = orderStatuses[i % orderStatuses.length];

      // Pick 1-2 random products
      const p1 = products[Math.floor(Math.random() * products.length)];
      const p2 = products[(Math.floor(Math.random() * products.length) + 1) % products.length];
      const itemsCount = Math.floor(Math.random() * 2) + 1;

      const orderItems = [];
      let subtotal = 0;

      // Add Item 1
      const p1Price = p1.discountPrice || p1.price;
      orderItems.push({
        product: p1._id,
        title: p1.title,
        price: p1Price,
        quantity: 1,
        color: "Camel",
        size: "M",
        image: p1.images[0],
      });
      subtotal += p1Price;

      // Add Item 2 if applicable
      if (itemsCount > 1) {
        const p2Price = p2.discountPrice || p2.price;
        orderItems.push({
          product: p2._id,
          title: p2.title,
          price: p2Price,
          quantity: 1,
          color: "Cream",
          size: "S",
          image: p2.images[0],
        });
        subtotal += p2Price;
      }

      const discount = subtotal > 10000 ? 2000 : 0;
      const shipping = subtotal > 5000 ? 0 : 150;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal - discount + shipping;

      const randomStateIndex = i % shippingStates.length;

      const orderData = {
        orderId,
        user: user._id,
        items: orderItems,
        shippingAddress: {
          name: user.name,
          street: `Appt ${100 + i}, Tower B, Luxe Residency`,
          city: shippingCities[randomStateIndex],
          state: shippingStates[randomStateIndex],
          postalCode: `${110000 + i * 7}`,
          country: "India",
          phone: `9876543${100 + i}`,
        },
        paymentDetails: {
          provider: "Razorpay",
          orderId: `pay_order_rzp_${i}`,
          paymentId: `pay_rzp_mock_${i}`,
          status: "Paid",
          method: "Card",
        },
        status,
        timeline: [
          { status: "Pending", description: "Order checked out by customer.", date: orderDate },
          { status: "Confirmed", description: "Payment verified. Order confirmed.", date: orderDate },
        ],
        summary: {
          subtotal,
          shipping,
          tax,
          discount,
          total,
        },
        createdAt: orderDate,
      };

      if (status === "Shipped" || status === "Delivered") {
        const shipDate = new Date(orderDate);
        shipDate.setDate(orderDate.getDate() + 1);
        orderData.timeline.push({
          status: "Shipped",
          description: "Package handed over to BlueDart express tracking AURA-BD-100" + i,
          date: shipDate,
        });
      }

      if (status === "Delivered") {
        const delivDate = new Date(orderDate);
        delivDate.setDate(orderDate.getDate() + 3);
        orderData.timeline.push({
          status: "Delivered",
          description: "Package successfully delivered at doorstep.",
          date: delivDate,
        });
      }

      mockOrders.push(orderData);
    }

    await Order.insertMany(mockOrders);
    console.log(`Seeded ${mockOrders.length} orders successfully!`);
    
    // Calculate total stats for review
    const totalRev = mockOrders.reduce((acc, o) => acc + o.summary.total, 0);
    console.log(`Total Seeded Revenue: Rs. ${totalRev.toLocaleString()}`);

    process.exit(0);
  } catch (error) {
    console.error("Order seeding error:", error);
    process.exit(1);
  }
}

seedOrders();
