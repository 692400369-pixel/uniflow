import { Router, Response } from "express";
import User from "../models/user";
import authMiddleware, {
  AuthRequest,
} from "../middleware/auth";

const router = Router();

// ==========================================
// GET CURRENT USER
// ==========================================

router.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await User.findById(
        req.user.userId
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// ==========================================
// UPDATE CURRENT USER
// ==========================================

router.put(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const {
        firstName,
        lastName,
        email,
      } = req.body;

      const user = await User.findById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (firstName) {
        user.firstName = String(firstName).trim();
      }

      if (lastName) {
        user.lastName = String(lastName).trim();
      }

      if (email) {
        const cleanEmail = String(email)
          .trim()
          .toLowerCase();

        const existingUser =
          await User.findOne({
            email: cleanEmail,
            _id: { $ne: user._id },
          });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }

        user.email = cleanEmail;
      }

      user.name = `${user.firstName} ${user.lastName}`;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Update user error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// ==========================================
// DELETE CURRENT USER
// ==========================================

router.delete(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user =
        await User.findByIdAndDelete(
          req.user.userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// ==========================================
// TEST PROTECTED ROUTE
// ==========================================

router.get(
  "/protected",
  authMiddleware,
  (req: AuthRequest, res: Response) => {
    return res.status(200).json({
      success: true,
      message: "Protected route is working",
      user: req.user,
    });
  }
);

export default router;