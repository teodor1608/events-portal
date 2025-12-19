const express = require("express");
const router = express.Router();
const AppDataSource = require("../config/database");

router.post("/", async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: "Name and location are required" });
    }

    const universityRepo = AppDataSource.getRepository("University");
    const university = universityRepo.create({ name, location });
    const savedUniversity = await universityRepo.save(university);

    res.status(201).json(savedUniversity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const universityRepo = AppDataSource.getRepository("University");
    const universities = await universityRepo.find({
      relations: ["students"],
    });

    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const universityRepo = AppDataSource.getRepository("University");
    const university = await universityRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["students"],
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    res.json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, location } = req.body;
    const universityRepo = AppDataSource.getRepository("University");

    const university = await universityRepo.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    if (name) university.name = name;
    if (location) university.location = location;

    const updatedUniversity = await universityRepo.save(university);
    res.json(updatedUniversity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const universityRepo = AppDataSource.getRepository("University");
    const university = await universityRepo.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    await universityRepo.remove(university);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
