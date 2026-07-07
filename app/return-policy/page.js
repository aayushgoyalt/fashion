import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ReturnPolicyPage() {
  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* Header */}
        <div className="border-b border-[#EAE2DC] pb-6 mb-8">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Customer Care</span>
          <h1 className="font-heading text-4xl font-bold tracking-wide mt-2">Returns & Exchanges Policy</h1>
        </div>

        <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
          <p>
            We take pride in our tailoring, but if an item does not meet your expectations, we offer simple exchange and return pickup services within 14 days of delivery.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">1. Eligibility Criteria</h3>
          <p>
            To qualify for a refund or replacement, returned garments must satisfy the following:
            <br/>
            - Unworn, unwashed, and undamaged in original condition.
            <br/>
            - Kept in original protective dustbags and boxes.
            <br/>
            - Intact price tags, barcode cards, and security loops.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">2. Non-Returnable Articles</h3>
          <p>
            Custom tailored clothing items, final clearance archive pieces, and select accessories (e.g. socks, headwear) are final sale and cannot be returned or exchanged.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">3. Requesting a Return</h3>
          <p>
            Returns can be initiated directly under your 'Profile Dashboard' in the Support Tickets section, or by emailing care@auraluxury.com. We will arrange a free reverse pickup at your doorstep.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">4. Refund Processing</h3>
          <p>
            Once returned items are received at our warehouse, they undergo a quality inspection. Upon verification, refunds are issued back to your source payment method within 5-7 business days.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
