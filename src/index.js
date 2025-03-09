require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("../models");
// Import all routes
const taskRoutes = require("../routes/taskRoutes");
const timeLogRoutes = require("../routes/timeLogRoutes");
const statsRoutes = require("../routes/statsRoutes");
const exportRoutes = require("../routes/exportRoutes");
const tipsRoutes = require("../routes/tipsRoutes");
const notificationsRoutes = require("../routes/notifications");
const settingsRoutes = require("../routes/settingsRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/expenses", require("../routes/expenseRoutes"));
app.use("/api/incomes", require("../routes/incomeRoutes"));
app.use("/api/categories", require("../routes/categoryRoutes"));
app.use("/api/achievements", require("../routes/achievementRoutes"));
app.use("/api/budgets", require("../routes/budgetRoutes"));
app.use("/api/statistics", statsRoutes);
app.use("/api/profile", require("../routes/userRoutes"));
app.use("/api/tasks", taskRoutes);
app.use("/api/time-logs", timeLogRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/tips", tipsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/settings", settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
