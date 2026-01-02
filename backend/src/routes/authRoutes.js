const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppDataSource = require("../config/database");
const { JWT_SECRET, requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register  { email, password }
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const userRepo = AppDataSource.getRepository("User");

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      // If the account exists and only has Google auth (no password set), return a helpful message
      if (!existing.passwordHash && existing.googleId) {
        return res.status(409).json({ error: "Account exists as Google-only. Please sign in with Google and set a password in account settings." });
      }
      return res.status(409).json({ error: "email already in use" });
    }

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
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    // If the account is Google-only (no password), guide the user
    if (!user.passwordHash) {
      return res.status(401).json({ error: "Account is Google-only. Please sign in with Google or set a password in account settings after signing in with Google." });
    }

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

// POST /api/auth/set-password  (authenticated users can set a local password)
router.post("/set-password", requireAuth, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters long" });

    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.passwordHash) return res.status(400).json({ error: "Password already set" });

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    await userRepo.save(user);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
