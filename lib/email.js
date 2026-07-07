import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");

/**
 * Reusable Resend email delivery service helper.
 *
 * @param {Object} options - Email parameters
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content of the email
 * @returns {Promise<Object>} Resend response details or mock confirmation
 */
export async function sendEmail({ to, subject, html }) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const isMock = !apiKey || apiKey === "re_mock" || apiKey.startsWith("re_mock");

    if (!isMock) {
      const data = await resend.emails.send({
        from: process.env.SENDER_EMAIL || "orders@resend.dev",
        to,
        subject,
        html,
      });
      return data;
    } else {
      console.log(`[EMAIL SEND SANDBOX] To: ${to} | Subject: ${subject}`);
      return { id: `email_mock_${Date.now()}` };
    }
  } catch (error) {
    console.error("Failed to transmit email via Resend:", error);
    throw error;
  }
}
