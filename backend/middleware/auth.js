const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "taskflow_dev_secret_change_in_prod";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    const err = new Error("Authentication required.");
    err.statusCode = 401;
    return next(err);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, username: payload.username };
    return next();
  } catch (e) {
    const err = new Error("Invalid or expired token.");
    err.statusCode = 401;
    return next(err);
  }
};
