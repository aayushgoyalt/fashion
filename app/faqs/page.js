import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQsPage() {
  const faqCategories = [
    {
      title: "Sizing & Fit",
      questions: [
        {
          q: "How do I choose the correct garment size?",
          a: "Every product page includes exact waist/chest measurements under the 'Specifications' tab. Since we design with a structured, slightly relaxed silhouette, we recommend selecting your standard size. If you prefer a closer fit, consider sizing down."
        },
        {
          q: "Do you offer custom tailoring services?",
          a: "For bespoke custom adjustments, please contact our Delhi atelier directly at care@auraluxury.com. We offer custom sleeve, leg hem, and chest tailoring for registered members."
        }
      ]
    },
    {
      title: "Shipping & Dispatches",
      questions: [
        {
          q: "How long will it take to deliver my order?",
          a: "All dispatches are processed within 24-48 business hours. Delivery typically takes 3 to 5 business days for domestic express shipments. You can track your order using the 'Track Order' portal."
        },
        {
          q: "What are your shipping rates?",
          a: "We offer complimentary express shipping on all domestic orders exceeding Rs. 5,000. Orders below Rs. 5,000 carry a flat shipping charge of Rs. 150."
        }
      ]
    },
    {
      title: "Returns & Exchanges",
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 14-day return and exchange policy for unworn, unwashed garments with tags intact. Returns can be initiated through your account dashboard or by mailing care@auraluxury.com."
        },
        {
          q: "How do I request a refund?",
          a: "Refunds are processed back to the original payment source (credit card, wallet, etc.) within 5-7 business days from the moment your return parcel passes quality inspection at our warehouse."
        }
      ]
    }
  ];

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Support Desk</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide">Frequently Asked Questions</h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Find answers to commonly asked questions regarding orders, sizing, and shipping.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-12 text-left">
          {faqCategories.map((category, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-camel border-b border-[#EAE2DC] pb-2">
                {category.title}
              </h3>
              
              <Accordion type="single" collapsible className="w-full bg-white rounded-2xl border border-[#EAE2DC] p-4 shadow-sm space-y-2">
                {category.questions.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${idx}-${i}`} className="border-b border-[#EAE2DC]/50 last:border-b-0">
                    <AccordionTrigger className="text-xs font-bold text-primary hover:text-camel tracking-wide py-4 text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

      </div>

      <Footer />
    </div>
  );
}
