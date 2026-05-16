// controllers/authController.js
// ─────────────────────────────────────────────────────────────
// Handles signup (with OTP email), OTP verification, and login.
// Passwords are hashed with bcryptjs — never stored in plain text.
// Sessions use a JWT token returned to the frontend.
// ─────────────────────────────────────────────────────────────

const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const nodemailer  = require("nodemailer");
const { query, run } = require("../config/database");

const createError = (msg, code) => { const e = new Error(msg); e.statusCode = code; return e; };

// ── JWT secret — in production store this in .env ─────────────
const JWT_SECRET = process.env.JWT_SECRET || "taskflow_dev_secret_change_in_prod";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

// ── Nodemailer transport selection ────────────────────────────
// Production and development both use Gmail SMTP with an App Password.
let cachedTransporter = null;

const isPlaceholderEmailConfig = () => {
  const user = EMAIL_USER.toLowerCase();
  const pass = EMAIL_PASS.toLowerCase();

  return !EMAIL_USER || !EMAIL_PASS ||
    user.includes("yourgmail") ||
    pass.includes("your_gmail_app_password") ||
    pass.includes("placeholder");
};

const createGmailTransport = () => nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const getFromAddress = () => {
  if (EMAIL_USER && EMAIL_USER.includes("@") && !EMAIL_USER.toLowerCase().includes("yourgmail")) {
    return `"TaskFlow" <${EMAIL_USER}>`;
  }

  return '"TaskFlow" <no-reply@taskflow.local>';
};

const getMailer = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!isPlaceholderEmailConfig()) {
    const gmailTransport = createGmailTransport();
    await gmailTransport.verify();
    cachedTransporter = gmailTransport;
    console.log("[Email] Gmail SMTP transporter verified.");
    return cachedTransporter;
  }

  throw new Error("EMAIL_USER and EMAIL_PASS are required.");
};

const validateEmailSetup = async () => {
  if (isPlaceholderEmailConfig()) {
    console.warn("[Email] EMAIL_USER / EMAIL_PASS are missing or still placeholders. Gmail OTP delivery will fail until a real Gmail address and App Password are configured.");
    return false;
  }

  try {
    const transport = createGmailTransport();
    await transport.verify();
    console.log("[Email] Gmail SMTP credentials verified at startup.");
    return true;
  } catch (err) {
    console.error("[Email] Gmail SMTP verification failed at startup:", err && err.message);
    return false;
  }
};

// ── Generate a 6-digit OTP ────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────────────────────
// POST /api/auth/signup
// Creates an unverified user and emails them a 6-digit OTP.
// ─────────────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim()) return next(createError("Username is required.", 400));
    if (!email?.trim() || !email.includes("@"))
      return next(createError("Valid email is required.", 400));
    if (!password || password.length < 6)
      return next(createError("Password must be at least 6 characters.", 400));

    // Check if email is already registered and verified
    const [existing] = query("SELECT * FROM users WHERE email = ?", [email.trim()]);
    if (existing && existing.verified) {
      return next(createError("An account with this email already exists.", 409));
    }

    const otp        = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;      // 10 minutes from now
    const hash       = await bcrypt.hash(password, 12);   // 12 salt rounds

    if (existing && !existing.verified) {
      // Resend OTP to an unverified account
      run(
        `UPDATE users SET otp = ?, otp_expires = ?, password_hash = ?, username = ?
         WHERE email = ?`,
        [otp, otpExpires, hash, username.trim(), email.trim()]
      );
    } else {
      // Fresh signup
      run(
        `INSERT INTO users (username, email, password_hash, otp, otp_expires, verified)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [username.trim(), email.trim(), hash, otp, otpExpires]
      );
    }

    // Send OTP email (with error handling to provide clearer diagnostics)
    try {
      const transporter = await getMailer();
      await transporter.sendMail({
        from:    getFromAddress(),
        to:      email.trim(),
        subject: "Your TaskFlow verification code",
        html: `
          <div style="font-family:monospace;max-width:400px;margin:0 auto;padding:32px;
                      background:#0f172a;color:#e2e8f0;border-radius:8px;">
            <h2 style="color:#fbbf24;margin-bottom:8px;">TaskFlow</h2>
            <p style="color:#94a3b8;margin-bottom:24px;">Your verification code:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                        color:#fbbf24;margin-bottom:24px;">${otp}</div>
            <p style="color:#64748b;font-size:12px;">
              This code expires in 10 minutes.<br/>
              If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      });

    } catch (mailErr) {
      console.error('[Email] Failed to send OTP email:', mailErr && mailErr.message);
      return next(createError(
        'Failed to send verification email. Check SMTP credentials (EMAIL_USER / EMAIL_PASS) and Gmail App Password (see https://support.google.com/mail/?p=BadCredentials).',
        502
      ));
    }

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete signup.",
      email:   email.trim(),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Verifies the OTP and activates the account.
// Returns a JWT token so the user is immediately logged in.
// ─────────────────────────────────────────────────────────────
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return next(createError("Email and OTP are required.", 400));

    const [user] = query("SELECT * FROM users WHERE email = ?", [email.trim()]);
    if (!user)    return next(createError("No account found for this email.", 404));

    if (user.otp !== otp) return next(createError("Invalid OTP.", 400));

    if (Date.now() > user.otp_expires) {
      return next(createError("OTP has expired. Please sign up again to get a new one.", 400));
    }

    // Mark as verified and clear the OTP
    run(
      "UPDATE users SET verified = 1, otp = NULL, otp_expires = NULL WHERE id = ?",
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Email verified successfully.",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Validates credentials and returns a JWT.
// ─────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(createError("Email and password are required.", 400));

    const [user] = query("SELECT * FROM users WHERE email = ?", [email.trim()]);
    if (!user) return next(createError("Invalid email or password.", 401));

    if (!user.verified)
      return next(createError("Please verify your email before logging in.", 403));

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) return next(createError("Invalid email or password.", 401));

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, verifyOtp, login, validateEmailSetup };