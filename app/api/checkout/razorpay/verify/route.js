import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      guestEmail,
      guestName,
      couponId,
      cartItems,
      summary,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !shippingAddress || !cartItems) {
      return NextResponse.json({ error: "Missing required checkout parameters" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = !keySecret || keySecret.includes("mock") || razorpay_order_id.startsWith("order_mock");

    // 1. Payment Signature Verification
    if (!isMock) {
      const generated_signature = crypto
        .createHmac("sha256", keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: "Payment verification signature mismatch" }, { status: 400 });
      }
    } else {
      console.log(`[PAYMENT VERIFY SANDBOX] Bypassing HMAC verification for Mock Order ID: ${razorpay_order_id}`);
    }

    await connectToDatabase();

    // 2. Resolve User Session Profile
    const dbUser = await getDbUser();
    const customerEmail = dbUser ? dbUser.email : guestEmail;
    const customerName = dbUser ? dbUser.name : guestName;

    // 3. Generate Readable Order ID (e.g. AURA-2026-1002)
    const count = await Order.countDocuments();
    const customOrderId = `AURA-2026-${1000 + count}`;

    // 4. Create Order Record
    const orderData = {
      orderId: customOrderId,
      user: dbUser ? dbUser._id : null,
      guestEmail: dbUser ? undefined : guestEmail,
      guestName: dbUser ? undefined : guestName,
      items: cartItems.map((item) => ({
        product: item.product,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        image: item.image,
      })),
      shippingAddress: {
        name: shippingAddress.name,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
      paymentDetails: {
        provider: "Razorpay",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: "Paid",
        method: isMock ? "Test Wallet" : "Card/Netbanking",
      },
      status: "Confirmed",
      timeline: [
        { status: "Pending", description: "Order checked out." },
        { status: "Confirmed", description: "Payment verified successfully. Order confirmed." },
      ],
      coupon: couponId || null,
      summary: {
        subtotal: summary.subtotal,
        shipping: summary.shipping,
        tax: summary.tax,
        discount: summary.discount,
        total: summary.total,
      },
    };

    const newOrder = await Order.create(orderData);

    // 5. Decrement inventory variant stock counts
    for (const item of cartItems) {
      await Product.updateOne(
        {
          _id: item.product,
          "variants.color": item.color,
          "variants.size": item.size,
        },
        {
          $inc: { "variants.$.stock": -item.quantity },
        }
      );
    }

    // 6. Register coupon usage
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, {
        $inc: { usageCount: 1 },
      });
    }

    // 7. Trigger Email Confirmation via Resend API
    if (customerEmail) {
      try {
        const itemsHtml = cartItems
          .map(
            (item) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #EAE2DC;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #2E2522;">${item.title}</p>
                <p style="margin: 0; font-size: 11px; color: #8B7D77; text-transform: uppercase;">Shade: ${item.color} / Size: ${item.size} (x${item.quantity})</p>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #EAE2DC; text-align: right; font-size: 14px; font-weight: bold; color: #2E2522;">
                Rs. ${item.price * item.quantity}
              </td>
            </tr>
          `
          )
          .join("");

        if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_mock")) {
          await resend.emails.send({
            from: process.env.SENDER_EMAIL || "orders@resend.dev",
            to: customerEmail,
            subject: `AURA Order Confirmed - ${customOrderId}`,
            html: `
              <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #EAE2DC; border-radius: 16px; background-color: #FCFAF7; color: #2E2522;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 0; color: #251D1A;">AURA</h1>
                  <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #8B7D77; margin-top: 5px;">Your Order Has Been Confirmed</p>
                </div>
                
                <p style="font-size: 14px; line-height: 1.6; color: #4E3629;">
                  Hello ${customerName || "Customer"}, <br/><br/>
                  Thank you for shopping with AURA. We are preparing your tailored selections. You will receive another dispatch email as soon as your parcel is handed over to our express courier partner.
                </p>
                
                <div style="background-color: #FAF6EE; padding: 20px; border-radius: 12px; border: 1px solid #EAE2DC; margin: 25px 0;">
                  <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #C19A6B;">Order Info</h3>
                  <p style="margin: 5px 0; font-size: 13px;"><b>ID:</b> ${customOrderId}</p>
                  <p style="margin: 5px 0; font-size: 13px;"><b>Date:</b> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                  <thead>
                    <tr>
                      <th style="text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8B7D77; border-bottom: 1px solid #EAE2DC; padding-bottom: 10px;">Item</th>
                      <th style="text-align: right; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8B7D77; border-bottom: 1px solid #EAE2DC; padding-bottom: 10px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style="padding: 10px 0; font-size: 12px; color: #8B7D77;">Subtotal</td>
                      <td style="padding: 10px 0; text-align: right; font-size: 12px; font-weight: bold;">Rs. ${summary.subtotal}</td>
                    </tr>
                    ${
                      summary.discount > 0
                        ? `
                    <tr>
                      <td style="padding: 10px 0; font-size: 12px; color: #8B7D77;">Discount</td>
                      <td style="padding: 10px 0; text-align: right; font-size: 12px; font-weight: bold; color: #16a34a;">- Rs. ${summary.discount}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr>
                      <td style="padding: 10px 0; font-size: 12px; color: #8B7D77;">Shipping</td>
                      <td style="padding: 10px 0; text-align: right; font-size: 12px; font-weight: bold;">${
                        summary.shipping === 0 ? "Free" : `Rs. ${summary.shipping}`
                      }</td>
                    </tr>
                    <tr>
                      <td style="padding: 15px 0 0 0; font-size: 14px; font-weight: bold; border-top: 1px solid #EAE2DC;">Total Amount</td>
                      <td style="padding: 15px 0 0 0; text-align: right; font-size: 16px; font-weight: bold; color: #2E2522; border-top: 1px solid #EAE2DC;">Rs. ${
                        summary.total
                      }</td>
                    </tr>
                  </tfoot>
                </table>
                
                <div style="background-color: #FAF6EE; padding: 20px; border-radius: 12px; border: 1px solid #EAE2DC; font-size: 12px; margin-top: 30px;">
                  <h3 style="margin-top: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #C19A6B;">Delivery Address</h3>
                  <p style="margin: 5px 0;">${shippingAddress.name}</p>
                  <p style="margin: 5px 0;">${shippingAddress.street}</p>
                  <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}</p>
                  <p style="margin: 5px 0;">Phone: ${shippingAddress.phone}</p>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #EAE2DC; margin: 40px 0;" />
                <p style="font-size: 10px; color: #8B7D77; text-align: center;">For inquiries, reply directly to this email or visit our Help Center.</p>
              </div>
            `,
          });
        } else {
          console.log(`[RESEND MOCK] Sent order confirmation email for ${customOrderId} to ${customerEmail}`);
        }
      } catch (err) {
        console.error("Resend confirmation email delivery failure:", err);
      }
    }

    return NextResponse.json({ success: true, orderId: customOrderId }, { status: 201 });
  } catch (error) {
    console.error("Payment verification API error:", error);
    return NextResponse.json({ error: "Failed to verify transaction and submit order" }, { status: 500 });
  }
}
