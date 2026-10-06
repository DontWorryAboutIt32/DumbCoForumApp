import { Router } from "express";
import { pool } from "../db/index.js";

// Define the interface for the request body when creating a new user
interface CreateUserBody {
  username: string;
  email: string;
}

const router = Router();

// GET /api/users - Retrieve all users
router.get("/", async (_req, res) => {
    // Query the database to get all users
  try {
    const result = await pool.query(
      `
      SELECT id, username, email, created_at
      FROM users
      ORDER BY id ASC
      `
    );

    res.json(result.rows);
  } catch (error) { // Handle any errors that occur during the database query
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve users",
    });
  }
});

// POST /api/users - Create a new user
router.post("/", async (req, res) => {
    // Extract the username and email from the request body
  try {
    const { username, email } = req.body as CreateUserBody;

    if (
      typeof username !== "string" ||
      typeof email !== "string"
    ) {
      res.status(400).json({
        status: "error",
        message: "Username and email must be strings",
      });

      return;
    }

    // Validate that the username and email are not empty 
    if (
      username.trim().length === 0 ||
      email.trim().length === 0
    ) {
      res.status(400).json({
        status: "error",
        message: "Username and email cannot be empty",
      });

      return;
    }

    // Normalize the username and email for consistent storage
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate the length of the username and the format of the email
    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 50
    ) {
      res.status(400).json({
        status: "error",
        message: "Username must be between 3 and 50 characters",
      });

      return;
    }

    // Validate that the email contains an "@" symbol to ensure it's a valid email format
    if (!normalizedEmail.includes("@")) {
      res.status(400).json({
        status: "error",
        message: "Email must be valid",
      });

      return;
    }

    // Insert the new user into the database with a temporary password hash
    const result = await pool.query(
      `
      INSERT INTO users (
        username,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
      `,
      [
        normalizedUsername,
        normalizedEmail,
        "temporary_hash",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) { // Handle any errors that occur during the database insertion
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Failed to create user",
    });
  }
});

export default router;