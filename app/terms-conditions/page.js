import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsConditionsPage() {
  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        
        {/* Header */}
        <div className="border-b border-[#EAE2DC] pb-6 mb-8">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Legal</span>
          <h1 className="font-heading text-4xl font-bold tracking-wide mt-2">Terms & Conditions</h1>
        </div>

        <div className="space-y-6 text-xs text-muted-foreground leading-relaxed">
          <p>
            By accessing or ordering from our website, you agree to comply with the terms and conditions outlined below.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">1. Catalog Pricing</h3>
          <p>
            While we strive for accuracy, listing prices or promotions on AURA catalog items may carry typographical errors. In such events, we reserve the right to cancel orders and process full refunds.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">2. Intellectual Property</h3>
          <p>
            All website assets including design templates, copy, icons, Mongoose structures, and logo branding are intellectual property owned by AURA.
          </p>

          <h3 className="text-xs uppercase tracking-widest font-bold text-primary pt-4">3. Governing Law</h3>
          <p>
            These terms and conditions are governed by the laws of India. Any disputes arising out of the use of this website shall be settled exclusively in the courts of New Delhi, India.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
