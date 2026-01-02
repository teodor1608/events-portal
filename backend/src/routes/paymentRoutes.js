const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

const AppDataSource = require("../config/database");
const { requireAuth } = require("../middleware/auth");
const { sendReservationPaidEmail } = require("../utils/email");


const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey);

const successUrl = process.env.STRIPE_SUCCESS_URL || "http://localhost:4200/payment/success";
const cancelUrl = process.env.STRIPE_CANCEL_URL || "http://localhost:4200/payment/cancel";
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/payments/create-checkout-session
// body: { reservationId }
router.post("/create-checkout-session", requireAuth, async (req, res) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) {
      return res.status(400).json({ error: "reservationId is required" });
    }

    const reservationRepo = AppDataSource.getRepository("Reservation");
    const eventRepo = AppDataSource.getRepository("Event");

    const reservation = await reservationRepo.findOne({
      where: { id: reservationId, userId: req.user.id },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (reservation.status !== "HELD") {
      return res.status(400).json({ error: "Reservation is not in HELD status" });
    }

    const event = await eventRepo.findOne({
      where: { id: reservation.eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: event.priceCents, // cents from DB
            product_data: {
              name: event.title,
              description: event.description || undefined,
            },
          },
          quantity: reservation.qty,
        },
      ],
      metadata: {
        reservationId: String(reservation.id),
        userId: String(req.user.id),
      },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe create session error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// GET /api/payments/confirm?session_id=...
router.get("/confirm", requireAuth, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const reservationId = session.metadata?.reservationId;
    const userId = session.metadata?.userId;

    if (!reservationId || !userId) {
      return res.status(400).json({ error: "Missing reservation metadata" });
    }

    if (parseInt(userId, 10) !== req.user.id) {
      return res.status(403).json({ error: "Not your reservation" });
    }

    const reservationRepo = AppDataSource.getRepository("Reservation");

    const reservation = await reservationRepo.findOne({
      where: { id: parseInt(reservationId, 10), userId: req.user.id },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res.json({ status: reservation.status });
  } catch (err) {
    console.error("Stripe confirm error:", err);
    return res.status(500).json({ error: "Failed to confirm payment" });
  }
});


// POST /api/payments/webhook 
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const reservationId = session.metadata?.reservationId;
    const userId = session.metadata?.userId;

    if (reservationId && userId) {
      try {
        const reservationRepo = AppDataSource.getRepository("Reservation");
        const userRepo = AppDataSource.getRepository("User");
        const eventRepo = AppDataSource.getRepository("Event");

        const reservation = await reservationRepo.findOne({
          where: { id: parseInt(reservationId, 10) },
        });

        if (!reservation) {
          console.warn(
            `Webhook: reservation ${reservationId} not found for checkout.session.completed`
          );
          return res.json({ received: true });
        }

        // mark as PAID if not already
        if (reservation.status !== "PAID") {
          reservation.status = "PAID";
          await reservationRepo.save(reservation);
          console.log(`Reservation ${reservation.id} marked PAID via webhook`);
        } else {
          console.log(
            `Reservation ${reservation.id} already PAID, skipping status update`
          );
        }

        const user = await userRepo.findOne({
          where: { id: parseInt(userId, 10) },
        });

        const eventEntity = await eventRepo.findOne({
          where: { id: reservation.eventId },
        });

        if (user && user.email && eventEntity) {
          // Fire-and-forget, don't delay Stripe's 200
          sendReservationPaidEmail({
            to: user.email,
            user,
            reservation,
            event: eventEntity,
          })
            .then(() => {
              console.log(
                `Email receipt with QR sent for reservation ${reservation.id}`
              );
            })
            .catch((err) => {
              console.error(
                `Failed to send email for reservation ${reservation.id}:`,
                err
              );
            });
        } else {
          console.warn(
            `Webhook: cannot send email for reservation ${reservationId} (missing user/email or event)`
          );
        }
      } catch (err) {
        console.error("Webhook reservation update error:", err);
      }
    } else {
      console.warn(
        "checkout.session.completed received without reservationId/userId metadata"
      );
    }
  }

  // Always acknowledge to Stripe so it doesn’t retry
  res.json({ received: true });
});


module.exports = router;
