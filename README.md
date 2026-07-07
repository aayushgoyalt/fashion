# AURA — Premium Clothing E-Commerce Platform

A production-ready, luxury fashion e-commerce storefront designed with a minimalist aesthetic and elegant user experience. Built using Next.js 15, Tailwind CSS, MongoDB, Auth.js, and Framer Motion.

---

## Technical Stack & Features

*   **Framework**: Next.js 15 (App Router, Server Actions, & Route Handlers)
*   **Database**: MongoDB Atlas with Mongoose ORM
*   **Authentication**: Auth.js (NextAuth) with Credentials signup/login
*   **Styling**: Tailwind CSS v4 & custom HSL warm-luxury palette variables
*   **Components**: Shadcn/ui & Radix primitives
*   **Animations**: Framer Motion micro-interactions & GSAP entrance staging
*   **Payments**: Razorpay API integration with automatic signature validation (includes sandbox fail-safes)
*   **Emails**: Resend API service integration with HTML layout templates
*   **Forms**: React Hook Form with Zod validation
*   **SEO**: Dynamic Metadata, Open Graph details, sitemap.xml, and robots.txt

---

## Directory Structure

```
├── app/                          # Page routes & layout wrappers
│   ├── api/                      # Backend endpoints (Auth, Cart, Products, Payment, Upload)
│   ├── about/                    # Brand story
│   ├── account/                  # Customer profile dashboard
│   ├── admin/                    # Store administrator console
│   ├── blog/                     # Editorial styling logs
│   ├── cart/                     # Cart details
│   ├── checkout/                 # Secure checkout payment portal
│   ├── faqs/                     # Collapsible FAQs
│   ├── shop/                     # Advanced catalog filter lists
│   └── track-order/              # Public shipment tracker
├── components/                   # Reusable components
│   ├── ui/                       # Core Shadcn components
│   ├── layout/                   # Navbar & Footer
│   ├── home/                     # Hero & categories masonry
│   ├── product/                  # Grid listings & details Buy Box
│   └── SessionProvider.jsx       # NextAuth Context bridge
├── lib/                          # Backend utilities (db, email, upload)
├── models/                       # Mongoose DB Schemas
├── scripts/                      # Seed scripts
└── public/                       # Uploads and asset hosting
```

---

## Setup & Local Installation

### 1. Clone the project and install packages:
```bash
npm install
```

### 2. Configure Environment variables:
Rename `.env.example` to `.env` or `.env.local` and supply your details:
```bash
cp .env.example .env
```
Key variables:
*   `MONGODB_URI`: Your MongoDB database connection string.
*   `NEXTAUTH_SECRET`: A secure random secret string (generate with `openssl rand -base64 32`).
*   `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: Your Razorpay keys (optional: defaults to mock checkout mode if unconfigured).
*   `RESEND_API_KEY`: Your Resend API credential key (optional: defaults to mock logger if unconfigured).

### 3. Run the Database Seed script:
Ensure a local or remote MongoDB database instance is running, and populate it with initial premium collection templates:
```bash
node scripts/seed.js
```

### 4. Boot the Local Dev Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## Production Build

To compile the production-ready build:
```bash
npm run build
npm start
```
