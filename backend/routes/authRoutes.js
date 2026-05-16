// routes/authRoutes.js
const express = require("express");
const router  = express.Router();
const { signup, verifyOtp, login } = require("../controllers/authController");

// POST /api/auth/signup      → send OTP email
router.post("/signup",     signup);

// POST /api/auth/verify-otp  → verify OTP, activate account
router.post("/verify-otp", verifyOtp);

// POST /api/auth/login       → return JWT
router.post("/login",       login);

module.exports = router;