require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");
const jwt = require("jsonwebtoken");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const taskRoutes = require("./routes/taskRoutes");
const timeLogRoutes = require("./routes/timeLogRoutes");
const statsRoutes = require("./routes/statsRoutes");
const exportRoutes = require("./routes/exportRoutes");
const userRoutes = require("./routes/userRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const tipsRoutes = require("./routes/tipsRoutes");
const notificationsRoutes = require("./routes/notifications");
const authMiddleware = require("./middleware/authMiddleware");
const {
  getDailyNetIncome,
  getFinancialOverview,
} = require("./controllers/statsController");
const {
  scheduleDailyReminders,
} = require("./controllers/notificationController");

// Import achievement cron jobs
require("./utils/achievementCron");

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(limiter);

// Serve static files from assets directory
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time-logs", timeLogRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/user", userRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/tips", tipsRoutes);
app.use("/api/notifications", notificationsRoutes);

// Add special route for statistics/monthly to match requested path
app.get("/api/statistics/monthly", authMiddleware, getDailyNetIncome);
app.get("/api/statistics/overview", authMiddleware, getFinancialOverview);

// Add a test endpoint to verify API is working
app.get("/api/test", (req, res) => {
  res.status(200).json({
    message: "API is working correctly",
    timestamp: new Date().toISOString(),
  });
});

// Initialize notification scheduler
scheduleDailyReminders();

// Add a database test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      message: "Database connection successful",
      dialect: sequelize.getDialect(),
      models: Object.keys(sequelize.models).join(", "),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Add an auth test endpoint
app.get("/api/auth-test", (req, res) => {
  const jwt = require("jsonwebtoken");

  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({
      message: "No Authorization header found",
      help: "Make sure to include 'Authorization: Bearer YOUR_TOKEN' header",
    });
  }

  try {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    if (!token) {
      return res.status(401).json({
        message: "No token found in Authorization header",
        receivedHeader: authHeader,
      });
    }

    // Try to decode without verification to see what's in the token
    const decodedWithoutVerify = jwt.decode(token);

    // Try proper verification
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.status(200).json({
        message: "Token is valid",
        tokenContent: decoded,
        tokenWithoutVerify: decodedWithoutVerify,
        jwtSecretFirstChars: process.env.JWT_SECRET
          ? process.env.JWT_SECRET.substring(0, 3) + "..."
          : "Not set",
      });
    } catch (verifyError) {
      return res.status(401).json({
        message: "Token verification failed",
        error: verifyError.message,
        tokenContent: decodedWithoutVerify,
        jwtSecretSet: !!process.env.JWT_SECRET,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error processing token",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("API жұмыс істеп тұр!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Сервер ${PORT} портында іске қосылды`);
});
