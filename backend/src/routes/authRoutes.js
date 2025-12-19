const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppDataSource = require("../config/database");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register  { email, password }
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const userRepo = AppDataSource.getRepository("User");

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = userRepo.create({
      email,
      passwordHash,
      role: "USER",
    });

    const saved = await userRepo.save(user);

    const token = jwt.sign(
      { id: saved.id, email: saved.email, role: saved.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOne({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
