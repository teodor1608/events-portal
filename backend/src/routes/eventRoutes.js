const express = require("express");
const router = express.Router();
const AppDataSource = require("../config/database");
const { requireAuth, requireRole } = require("../middleware/auth");


const ALLOWED_TYPES = new Set([
  "music",
  "sports",
  "theatre",
  "festival",
  "exhibition",
  "workshop",
  "community",
  "other",
]);

const ALLOWED_STATUS = new Set(["DRAFT", "SCHEDULED", "CANCELLED", "COMPLETED"]);

// GET /api/events/admin  (ADMIN only)
router.get("/admin", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const eventRepo = AppDataSource.getRepository("Event");
    const events = await eventRepo.find({
      order: { startsAt: "DESC" },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/events/:id  (ADMIN only)
router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const eventRepo = AppDataSource.getRepository("Event");
    const id = parseInt(req.params.id, 10);

    let event = await eventRepo.findOne({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const {
      title,
      description,
      type,
      startsAt,
      endsAt,
      city,
      venue,
      imageUrl,
      priceCents,
      totalSeats,
      status,
      isPublished,
    } = req.body;

    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.type = type ?? event.type;
    event.startsAt = startsAt ? new Date(startsAt) : event.startsAt;
    event.endsAt = endsAt ? new Date(endsAt) : event.endsAt;
    event.city = city ?? event.city;
    event.venue = venue ?? event.venue;
    event.imageUrl = imageUrl ?? event.imageUrl;
    event.priceCents = priceCents ?? event.priceCents;
    event.totalSeats = totalSeats ?? event.totalSeats;
    event.status = status ?? event.status;
    event.isPublished = typeof isPublished === "boolean" ? isPublished : event.isPublished;

    event = await eventRepo.save(event);

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/events/admin/:id  (ADMIN only, sees all statuses)
router.get("/admin/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const eventRepo = AppDataSource.getRepository("Event");
    const event = await eventRepo.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("GET /api/events/admin/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Create event
router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startsAt,
      endsAt,
      city,
      venue,
      imageUrl,
      priceCents,
      totalSeats,
      status,
      isPublished,
    } = req.body;

    if (!title || !startsAt || !city || !venue) {
      return res.status(400).json({
        error: "title, startsAt, city, and venue are required",
      });
    }

    const normalizedType = type ?? "other";
    if (!ALLOWED_TYPES.has(normalizedType)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const normalizedStatus = status ?? "DRAFT";
    if (!ALLOWED_STATUS.has(normalizedStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const seats = parseInt(totalSeats ?? 0, 10);
    if (Number.isNaN(seats) || seats < 0) {
      return res.status(400).json({ error: "totalSeats must be a non-negative integer" });
    }

    const eventRepo = AppDataSource.getRepository("Event");

    const event = eventRepo.create({
      title,
      description: description ?? null,
      type: normalizedType,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      city,
      venue,
      imageUrl: imageUrl ?? null,
      priceCents: parseInt(priceCents ?? 0, 10),
      currency: "EUR",
      totalSeats: seats,
      availableSeats: seats,
      status: normalizedStatus,
      isPublished: Boolean(isPublished ?? false),
    });

    const saved = await eventRepo.save(event);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC: List events with filters
router.get("/", async (req, res) => {
  try {
    const { from, to, type } = req.query;

    const eventRepo = AppDataSource.getRepository("Event");
    const qb = eventRepo.createQueryBuilder("e")
      .where("e.isPublished = :pub", { pub: true })
      .andWhere("e.status != :cancelled", { cancelled: "CANCELLED" });

    if (type) qb.andWhere("e.type = :type", { type: String(type) });

    if (from) qb.andWhere("e.startsAt >= :from", { from: new Date(String(from)) });
    if (to) qb.andWhere("e.startsAt <= :to", { to: new Date(String(to)) });

    qb.orderBy("e.startsAt", "ASC");

    const events = await qb.getMany();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC: Event details
router.get("/:id", async (req, res) => {
  try {
    const eventRepo = AppDataSource.getRepository("Event");
    const event = await eventRepo.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!event || !event.isPublished || event.status === "CANCELLED") {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const eventRepo = AppDataSource.getRepository("Event");
    let event = await eventRepo.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if( event.status === "CANCELLED" && !event.isPublished ) {
      // hard delete
      await eventRepo.remove(event);
    }else {
      // soft delete: hide it from public + mark cancelled
      event.isPublished = false;
      event.status = "CANCELLED";
      await eventRepo.save(event);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
