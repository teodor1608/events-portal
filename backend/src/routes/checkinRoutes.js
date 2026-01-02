const express = require("express");
const router = express.Router();
const AppDataSource = require("../config/database");
const { requireAuth, requireRole } = require("../middleware/auth");

// POST /api/checkin
// ADMIN only: requireAuth + requireRole('ADMIN')
router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) {
      return res.status(400).json({ error: "reservationId is required" });
    }

    const id = parseInt(reservationId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "reservationId must be a number" });
    }

    const reservationRepo = AppDataSource.getRepository("Reservation");

    const reservation = await reservationRepo.findOne({
      where: { id },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Only PAID / CHECKEDIN 
    if (reservation.status !== "PAID" && reservation.status !== "CHECKED_IN") {
      return res.status(400).json({
        error: `Invalid reservation status for check-in: ${reservation.status}`,
      });
    }

    // Already checked in
    if (reservation.status === "CHECKED_IN") {
      return res.status(400).json({
        error: "Ticket already checked in",
        status: reservation.status,
      });
    }

    // First time checkin
    reservation.status = "CHECKED_IN";
    await reservationRepo.save(reservation);

    return res.json(reservation);
  } catch (err) {
    console.error("Check-in error:", err);
    return res.status(500).json({ error: "Failed to process check-in" });
  }
});

module.exports = router;
