import { Router, Request, Response } from "express";
import Goal from "../models/goal";
import authMiddleware from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const goals = await Goal.find({
        userId,
      }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        goals,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const {
        title,
        description,
        category,
        deadline,
        progress,
        completed,
      } = req.body;

      if (!title || !deadline) {
        return res.status(400).json({
          success: false,
          message: "Title and deadline are required",
        });
      }

      const goal = await Goal.create({
        userId,
        title,
        description: description || "",
        category: category || "Study",
        deadline,
        progress: progress ?? 0,
        completed: completed ?? false,
      });

      return res.status(201).json({
        success: true,
        goal,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const goal = await Goal.findOneAndUpdate(
        {
          _id: req.params.id,
          userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: "Goal not found",
        });
      }

      return res.json({
        success: true,
        goal,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const goal = await Goal.findOneAndDelete({
        _id: req.params.id,
        userId,
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: "Goal not found",
        });
      }

      return res.json({
        success: true,
        message: "Goal deleted successfully",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;