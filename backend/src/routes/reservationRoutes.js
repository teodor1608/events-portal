const express = require("express");
const router = express.Router();
const AppDataSource = require("../config/database");
const { requireAuth } = require("../middleware/auth");


const HOLD_MINUTES = 10;

// POST /api/reservations
// body: { eventId, qty }
router.post("/", requireAuth, async (req, res) => {
  const { eventId, qty } = req.body;

  if (!eventId || !qty) {
    return res.status(400).json({ error: "eventId and qty are required" });
  }

  const quantity = parseInt(qty, 10);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "qty must be a positive integer" });
  }

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const eventRepo = queryRunner.manager.getRepository("Event");
    const reservationRepo = queryRunner.manager.getRepository("Reservation");

    const event = await eventRepo.findOne({
      where: { id: parseInt(eventId, 10) },
    });

    if (!event || !event.isPublished || event.status === "CANCELLED") {
      throw new Error("Event not available");
    }

    if (event.availableSeats < quantity) {
      throw new Error("Not enough available seats");
    }

    // decrement seats
    event.availableSeats -= quantity;
    await eventRepo.save(event);

    const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

    const reservation = reservationRepo.create({
      eventId: event.id,
      userId: req.user.id,
      qty: quantity,
      status: "HELD",
      holdExpiresAt,
    });

    const saved = await reservationRepo.save(reservation);

    await queryRunner.commitTransaction();

    res.status(201).json(saved);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    await queryRunner.release();
  }
});

module.exports = router;