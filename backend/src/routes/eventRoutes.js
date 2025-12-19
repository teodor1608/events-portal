const express = require("express");
const router = express.Router();
const AppDataSource = require("../config/database");

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

// ADMIN: Create event
router.post("/", async (req, res) => {
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

// ADMIN: Update event
router.put("/:id", async (req, res) => {
  try {
    const eventRepo = AppDataSource.getRepository("Event");
    const event = await eventRepo.findOne({
      where: { id: parseInt(req.params.id) },
    });

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

    if (type != null && !ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }
    if (status != null && !ALLOWED_STATUS.has(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // seat rule: totalSeats cannot be set below already reserved/sold
    if (totalSeats != null) {
      const newTotal = parseInt(totalSeats, 10);
      if (Number.isNaN(newTotal) || newTotal < 0) {
        return res.status(400).json({ error: "totalSeats must be a non-negative integer" });
      }

      const reservedOrSold = event.totalSeats - event.availableSeats;
      if (newTotal < reservedOrSold) {
        return res.status(400).json({
          error: `totalSeats cannot be below already reserved/sold (${reservedOrSold})`,
        });
      }

      const diff = newTotal - event.totalSeats;
      event.totalSeats = newTotal;
      event.availableSeats = Math.min(newTotal, event.availableSeats + diff);
    }

    if (title != null) event.title = title;
    if (description !== undefined) event.description = description;
    if (type != null) event.type = type;
    if (startsAt != null) event.startsAt = new Date(startsAt);
    if (endsAt !== undefined) event.endsAt = endsAt ? new Date(endsAt) : null;
    if (city != null) event.city = city;
    if (venue != null) event.venue = venue;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (priceCents != null) event.priceCents = parseInt(priceCents, 10) || 0;

    event.currency = "EUR"; // keep fixed
    if (status != null) event.status = status;
    if (isPublished != null) event.isPublished = Boolean(isPublished);

    const saved = await eventRepo.save(event);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Delete event
router.delete("/:id", async (req, res) => {
  try {
    const eventRepo = AppDataSource.getRepository("Event");
    const event = await eventRepo.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    await eventRepo.remove(event);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
