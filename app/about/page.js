import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Eye } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Editorial Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-20">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">The House</span>
          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-wide">Our Story</h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            Founded in 2026, AURA was built on a singular premise: to create luxury garments that transcend seasons, crafted in harmony with the environment.
          </p>
        </div>

        {/* Narrative Panel 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6 text-left">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Philosophy</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">
              The Architecture of Slow Tailoring
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We reject speed-driven fashion cycles. Every AURA silhouette is constructed over months of design refinement, ensuring that each cut falls with natural structure and comfort.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our tailoring aligns modern minimalism with traditional European craftsmanship. By releasing small capsule collections rather than mass volumes, we minimize environmental waste while maintaining absolute design integrity and detail control.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-[#EAE2DC]">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800"
              alt="Model posing in linen coat"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Core Pillars */}
        <div className="bg-white border border-[#EAE2DC] p-8 sm:p-12 rounded-2xl shadow-sm mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-3 text-center md:text-left">
              <div className="p-3 bg-[#FAF6EE] text-camel rounded-full w-fit mx-auto md:mx-0">
                <Sparkles size={20} />
              </div>
              <h4 className="text-xs uppercase tracking-widest font-bold">Uncompromising Sourcing</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use organic Belgian flax linen, grade-A cashmere from inner Mongolia, and premium virgin wool weaves dyed with organic vegetable pigments.
              </p>
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="p-3 bg-[#FAF6EE] text-camel rounded-full w-fit mx-auto md:mx-0">
                <Shield size={20} />
              </div>
              <h4 className="text-xs uppercase tracking-widest font-bold">Traceable Production</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our supply chains are completely transparent. Every mill, spinner, and tailoring house we partner with provides certified fair-wage environments.
              </p>
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="p-3 bg-[#FAF6EE] text-camel rounded-full w-fit mx-auto md:mx-0">
                <Eye size={20} />
              </div>
              <h4 className="text-xs uppercase tracking-widest font-bold">Design Longevity</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We reinforce pockets, double-line structured seams, and source brushed brass closures, mapping each item to outlast the decade.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center space-y-6 max-w-xl mx-auto">
          <h3 className="font-heading text-2xl sm:text-3xl font-bold">Experience The Collection</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Browse our catalog and discover garments designed with ultimate purpose.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest bg-primary hover:bg-coffee text-white px-8 py-4 rounded-full transition-all"
            >
              Shop The Catalog <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
