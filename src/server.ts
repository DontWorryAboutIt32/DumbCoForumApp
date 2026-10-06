import express from "express";
import "dotenv/config";
import { pool } from "./db/index.js";
import usersRouter from "./routes/users.js";

const app = express();

app.use(express.json());

// Use the users router for handling user-related routes
app.use("/api/users", usersRouter);

// Endpoint to check API status
app.get("/", (_req, res) => {
  res.json({ message: "Forum API running" });
});

// Endpoint to check API health
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Forum API is healthy"
  });
});

// Endpoint to check database health
app.get("/api/db-health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS value");

    res.json({
      status: "ok",
      database: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});