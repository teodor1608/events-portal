const express = require("express");
const AppDataSource = require("../config/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/me/reservations
router.get("/me/reservations", requireAuth, async (req, res) => {
  try {
    const reservationRepo = AppDataSource.getRepository("Reservation");
    const eventRepo = AppDataSource.getRepository("Event");

    const reservations = await reservationRepo.find({
      where: { userId: req.user.id },
      order: { createdAt: "DESC" },
    });

    // attach event summary
    const eventIds = [...new Set(reservations.map(r => r.eventId))];
    let events = [];
    if (eventIds.length) {
      events = await eventRepo
        .createQueryBuilder("e")
        .where("e.id IN (:...ids)", { ids: eventIds })
        .getMany();
    }
    const byId = new Map(events.map(e => [e.id, e]));

    res.json(
      reservations.map(r => ({
        ...r,
        event: byId.get(r.eventId) || null,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
