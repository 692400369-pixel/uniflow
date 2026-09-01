import { Router, Request, Response } from "express";
import Assignment from "../models/assignment";
import authMiddleware from "../middleware/auth";

const router = Router();

/* GET ALL */

router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const assignments = await Assignment.find({
        userId,
      }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        assignments,
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

/* CREATE */

router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const {
        title,
        course,
        courseCode,
        due,
        priority,
        status,
        progress,
      } = req.body;

      if (!title || !course || !courseCode || !due) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
        });
      }

      const assignment = await Assignment.create({
        userId,
        title,
        course,
        courseCode,
        due,
        priority: priority || "Medium",
        status: status || "Pending",
        progress: progress ?? 0,
      });

      return res.status(201).json({
        success: true,
        assignment,
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

/* UPDATE */

router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const assignment =
        await Assignment.findOneAndUpdate(
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

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      return res.json({
        success: true,
        assignment,
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

/* DELETE */

router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const assignment =
        await Assignment.findOneAndDelete({
          _id: req.params.id,
          userId,
        });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      return res.json({
        success: true,
        message: "Assignment deleted successfully",
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