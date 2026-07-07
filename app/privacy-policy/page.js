import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* Header */}
        <div className="border-b border-[#EAE2DC] pb-6 mb-8">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Legal</span>
          <h1 className="font-heading text-4xl font-bold tracking-wide mt-2">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
          <p>
            This Privacy Policy outlines how AURA collects, stores, and utilizes customer information across our website and checkout services.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">1. Information Collection</h3>
          <p>
            We collect personal coordinates (name, email, shipping coordinates, telephone numbers) during checkout registration and account creation. We do not store payment card information; all transactions are securely encrypted and processed by Razorpay.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">2. Cookies & Tracking</h3>
          <p>
            We use essential cookies to maintain shopping cart lists, keep you signed into your profile, and analyze catalog traffic patterns.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">3. Data Sharing</h3>
          <p>
            AURA does not sell or share customer data with third-party advertisers. Information is disclosed exclusively to our hosting providers, logistics express couriers, and payment gateways for order dispatches.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
