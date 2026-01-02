// backend/utils/email.js
const sgMail = require("@sendgrid/mail");
const QRCode = require("qrcode");

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const mailFrom =
  process.env.MAIL_FROM || "Events Portal <no-reply@events-portal.local>";
const checkinBaseUrl =
  process.env.CHECKIN_BASE_URL || "https://your-frontend.com/checkin";

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
} else {
  console.warn("SENDGRID_API_KEY is not set – emails will fail.");
}

/**
 * Build the URL that will be encoded into the QR.
 * Example: https://your-frontend.com/checkin?reservationId=123
 */
function buildCheckinUrl(reservationId) {
  return `${checkinBaseUrl}?reservationId=${encodeURIComponent(reservationId)}`;
}

/**
 * Generate QR code PNG buffer for reservation check-in.
 * QR content = the check-in URL containing reservationId.
 */
async function generateReservationQr(reservation) {
  if (!reservation.id) {
    throw new Error("Reservation is missing id");
  }

  const url = buildCheckinUrl(reservation.id);

  return QRCode.toBuffer(url, {
    type: "png",
    width: 400,
    errorCorrectionLevel: "M",
  });
}

/**
 * Send payment receipt email with QR ticket.
 *
 * @param {Object} params
 * @param {string} params.to
 * @param {Object} params.user
 * @param {Object} params.reservation
 * @param {Object} params.event
 */
async function sendReservationPaidEmail({ to, user, reservation, event }) {
  if (!to) {
    console.warn("sendReservationPaidEmail called without 'to'");
    return;
  }

  const qrBuffer = await generateReservationQr(reservation);

  const totalPrice = (event.priceCents * reservation.qty) / 100;

  const userName =
    user.name ||
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "";

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111; max-width:600px;">
      <h2>Payment confirmed ✅</h2>
      <p>Hi ${userName || "there"},</p>
      <p>Thank you for your purchase! Your reservation has been confirmed.</p>

      <h3>Event details</h3>
      <ul>
        <li><strong>Event:</strong> ${event.title}</li>
        <li><strong>Quantity:</strong> ${reservation.qty}</li>
        <li><strong>Total paid:</strong> €${totalPrice.toFixed(2)}</li>
        ${
          event.date
            ? `<li><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</li>`
            : ""
        }
      </ul>

      <h3>Your ticket (QR)</h3>
      <p>Show this QR code at the entrance to check in:</p>
      <p><img src="cid:reservation-qr" alt="Ticket QR" /></p>

      <p style="margin-top:24px;">See you there 👋</p>
    </div>
  `;

  const msg = {
    to,
    from: mailFrom,
    subject: `Your ticket for ${event.title}`,
    html,
    attachments: [
      {
        content: qrBuffer.toString("base64"),
        filename: "ticket-qr.png",
        type: "image/png",
        disposition: "inline",
        content_id: "reservation-qr",
      },
    ],
  };

  await sgMail.send(msg);
}

module.exports = {
  sendReservationPaidEmail,
};
