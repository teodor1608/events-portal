const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const AppDataSource = require("../config/database");
const { JWT_SECRET, requireAuth } = require("../middleware/auth");
const axios = require("axios");

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// POST /api/auth/google  { idToken }
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });
    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;

    const userRepo = AppDataSource.getRepository("User");

    // Prefer googleId match; fallback to email match
    let user =
      (await userRepo.findOne({ where: { googleId } })) ||
      (await userRepo.findOne({ where: { email } }));

    if (!user) {
      user = userRepo.create({
        email,
        googleId,
        role: "USER",
        passwordHash: null, // google-only account
      });
      user = await userRepo.save(user);
    } else if (!user.googleId) {
      // Link Google account to existing user by setting `user.googleId`.
      user.googleId = googleId;
      user = await userRepo.save(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch {
    res.status(401).json({ error: "Invalid Google token" });
  }
});

// POST /api/auth/google/redirect { code }
router.post("/google/redirect", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });
    if (!GOOGLE_CLIENT_SECRET) return res.status(500).json({ error: "Missing GOOGLE_CLIENT_SECRET" });
    if (!GOOGLE_REDIRECT_URI) return res.status(500).json({ error: "Missing GOOGLE_REDIRECT_URI" });

    // Exchange authorization code
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const idToken = tokenRes.data?.id_token;
    if (!idToken) return res.status(401).json({ error: "No id_token returned from Google" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;

    const userRepo = AppDataSource.getRepository("User");

    let user =
      (await userRepo.findOne({ where: { googleId } })) ||
      (await userRepo.findOne({ where: { email } }));

    let linked = false;
    let created = false;

    if (!user) {
      created = true;
      user = userRepo.create({
        email,
        googleId,
        role: "USER",
        passwordHash: null,
      });
      user = await userRepo.save(user);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // New user created, return token and flags
      return res.json({ token, linked: false, created: true, hasPassword: !!user.passwordHash });
    }

    if (!user.googleId) {
      return res.json({ needsLink: true, email: user.email, idToken });
    }

    // User already linked; proceed to sign a token and return
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, linked: true, created: false, hasPassword: !!user.passwordHash });
  } catch (err) {
    console.error(err?.response?.data || err?.message || err);
    res.status(401).json({ error: "Google redirect login failed" });
  }
});

// POST /api/auth/google/link  { idToken }  (authenticated users can link Google to their account)
router.post("/google/link", requireAuth, async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });
    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });

    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;

    // Ensure the token email matches the authenticated user email to prevent linking another account
    if (email !== req.user.email) return res.status(403).json({ error: "Google account email does not match authenticated user" });

    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.googleId = googleId;
    await userRepo.save(user);

    res.json({ success: true });
  } catch (err) {
    console.error(err?.message || err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

module.exports = router;
