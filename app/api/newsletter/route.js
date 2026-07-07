import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Try to send welcoming email via Resend
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_mock")) {
      await resend.emails.send({
        from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
        to: email,
        subject: "Welcome to the AURA Journal",
        html: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #EAE2DC; border-radius: 16px; background-color: #FCFAF7; color: #2E2522;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; font-weight: bold; letter-spacing: 6px; margin: 0; color: #251D1A;">AURA</h1>
              <p style="font-size: 10px; uppercase; tracking-widest; letter-spacing: 2px; color: #8B7D77; margin-top: 5px;">Luxury Clothing & Curated Tailoring</p>
            </div>
            
            <h2 style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 500; text-align: center; margin-bottom: 20px;">Welcome to the Inner Circle</h2>
            
            <p style="font-size: 14px; line-height: 1.8; color: #4E3629; text-align: center;">
              You have been registered successfully to the AURA Journal. From now on, you will receive private notifications of new seasonal collections, capsule drops, and custom-tailoring style insights.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shop" style="background-color: #251D1A; color: #FAF6EE; text-decoration: none; padding: 12px 30px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px;">Explore The Store</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #EAE2DC; margin: 40px 0;" />
            
            <p style="font-size: 10px; color: #8B7D77; text-align: center; line-height: 1.6;">
              You are receiving this email because you subscribed to the AURA newsletter. <br/>
              If you wish to opt-out, you can <a href="#" style="color: #C19A6B; text-decoration: underline;">unsubscribe here</a> at any time.
            </p>
          </div>
        `,
      });
    } else {
      console.log(`[RESEND MOCK] Sent newsletter welcome email to ${email}`);
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
