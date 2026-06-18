const dotenv       = require("dotenv");
dotenv.config();
const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const connectDB    = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
// const deityRoutes = require("./routes/deityRoutes");

// ── Routes ──
const authRoutes     = require("./routes/authRoutes");
const templeRoutes   = require("./routes/templeRoutes");
const districtRoutes = require("./routes/districtRoutes");
const festivalRoutes = require("./routes/festivalRoutes");
const blogRoutes     = require("./routes/blogRoutes");
const reviewRoutes   = require("./routes/reviewRoutes");
const uploadRoutes   = require("./routes/uploadRoutes");

connectDB();

const app = express();

// ── Middleware ──
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "https://tirthsthal.netlify.app",
    process.env.CLIENT_URL,
    process.env.ADMIN_CLIENT_URL,
  ].filter(Boolean);

  if (!origin || allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  if (req.method === "OPTIONS") return res.sendStatus(200);
});

// Remove the old app.use(cors({...})) line completely
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes Mount ──
app.use("/api/auth",      authRoutes);
app.use("/api/temples",   templeRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/festivals", festivalRoutes);
app.use("/api/blogs",     blogRoutes);
app.use("/api/upload",    uploadRoutes);
// app.use("/api/deities", deityRoutes);


// ── Nested review route: /api/temples/:templeId/reviews ──
app.use("/api/temples/:templeId/reviews", reviewRoutes);

// ── Health Check ──
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🛕 Tirthstal API is running!",
    version: "1.0.0",
    routes: [
      "POST   /api/auth/register",
      "POST   /api/auth/login",
      "POST   /api/auth/checkemail",
      "POST   /api/auth/resetpassword",
      "GET    /api/auth/profile",
      "PUT    /api/auth/profile",
      "GET    /api/temples",
      "GET    /api/temples/search?q=",
      // "POST   /api/createTemple",
      "GET    /api/temples/:slug",
      "POST   /api/temples/:id/favorite",
      "GET    /api/temples/:templeId/reviews",
      "POST   /api/temples/:templeId/reviews",
      "GET    /api/districts",
      "GET    /api/districts/:slug",
      "GET    /api/festivals",
      "GET    /api/festivals/upcoming",
      "GET    /api/festivals/:slug",
      "GET    /api/blogs",
      "GET    /api/blogs/featured",
      "GET    /api/blogs/categories",
      "GET    /api/blogs/:slug",
    ],
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});


// ── Error Handler ──
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only listen locally — Vercel handles the server itself
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
    console.log('EveryThing is Working Fine')
  });
}

module.exports = app;