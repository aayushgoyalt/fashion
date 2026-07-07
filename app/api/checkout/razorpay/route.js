import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const { amount, currency = "INR" } = await request.json();
    if (!amount) {
      return NextResponse.json({ error: "Payment amount is required" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if key credentials are placeholders or missing (activates mock developer sandbox)
    const isMock = !keyId || !keySecret || keyId.includes("mock") || keyId.startsWith("rzp_test_mock");

    if (isMock) {
      console.warn("[PAYMENT SANDBOX] Razorpay keys are unconfigured. Activating Mock transaction mode.");
      return NextResponse.json({
        id: `order_mock_${Date.now()}_${Math.round(Math.random() * 1e5)}`,
        amount: Math.round(amount * 100),
        currency,
        isMock: true,
        key: "rzp_test_mockkey_id",
      });
    }

    const razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100), // Convert Rs. to Paisa (Razorpay requirement)
      currency,
      receipt: `rcpt_aur_${Date.now()}_${Math.round(Math.random() * 1e4)}`,
    };

    const order = await razorpayInstance.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      isMock: false,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Failed to initialize payment gateway order" }, { status: 500 });
  }
}
