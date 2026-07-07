import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ShippingPolicyPage() {
  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* Header */}
        <div className="border-b border-[#EAE2DC] pb-6 mb-8">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Customer Care</span>
          <h1 className="font-heading text-4xl font-bold tracking-wide mt-2">Shipping & Delivery Policy</h1>
        </div>

        <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
          <p>
            Welcome to AURA. We are committed to delivering our tailored garments safely and quickly. All domestic orders are shipped from our central atelier in New Delhi, India.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">1. Dispatch Timelines</h3>
          <p>
            Orders for items currently in stock are processed and handed over to our premium courier partners within 24 to 48 hours (excluding Saturdays, Sundays, and public holidays). Pre-ordered or custom tailored items will be dispatched based on timelines mentioned on their respective catalog detail pages.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">2. Shipping Tiers & Costs</h3>
          <p>
            - <b>Express Delivery</b> (3-5 business days): Complimentary for all orders above Rs. 5,000. A flat shipping fee of Rs. 150 is charged for orders below Rs. 5,000.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">3. Tracking Your Parcel</h3>
          <p>
            Upon dispatch, a shipping confirmation notification containing a tracking number will be emailed to your registered address. You can query shipment coordinates anytime on our website under the 'Track Order' directory.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">4. Damaged or Lost Shipments</h3>
          <p>
            Every AURA dispatch is fully insured. In the rare event of a transit damage or lost package, please notify our service desk immediately at care@auraluxury.com with your order number. We will authorize a replacement or refund processing.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
