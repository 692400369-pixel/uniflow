import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";

const router = Router();

// ==========================================
// JWT SECRET
// ==========================================

const JWT_SECRET =
  process.env.JWT_SECRET || "uniflow_secret_key";

// ==========================================
// REGISTER
// ==========================================

router.post(
  "/register",
  async (req: Request, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
      } = req.body;

      // Check required fields
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Clean data
      const cleanFirstName = String(firstName).trim();
      const cleanLastName = String(lastName).trim();
      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      // Check password length
      if (String(password).length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({
        email: cleanEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        String(password),
        10
      );

      // ==========================================
      // CREATE USER
      // ==========================================

      const user = new User({
        // IMPORTANT:
        // Your User model requires "name"
        name: `${cleanFirstName} ${cleanLastName}`,

        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        password: hashedPassword,
      });

      await user.save();

      // ==========================================
      // CREATE JWT TOKEN
      // ==========================================

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(201).json({
        success: true,
        message: "Account created successfully",

        token,

        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("❌ REGISTER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
        error:
          error?.message ||
          "Unknown server error",
      });
    }
  }
);

// ==========================================
// LOGIN
// ==========================================

router.post(
  "/login",
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        password,
      } = req.body;

      // Check required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      // Clean email
      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      // Find user
      const user = await User.findOne({
        email: cleanEmail,
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      // Compare password
      const passwordMatch =
        await bcrypt.compare(
          String(password),
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      // ==========================================
      // CREATE JWT TOKEN
      // ==========================================

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({
        success: true,
        message: "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("❌ LOGIN ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
        error:
          error?.message ||
          "Unknown server error",
      });
    }
  }
);

// ==========================================
// TEST AUTH ROUTE
// ==========================================

router.get(
  "/test",
  (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: "Auth routes are working",
    });
  }
);

// ==========================================
// EXPORT
// ==========================================

export default router;