import AuthProvider from "@/components/SessionProvider";
import { CartProvider } from "@/components/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "AURA - Premium Luxury Apparel",
  description: "Exquisite tailoring meets modern minimalist fashion. Explore curated collections of luxury clothing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}



