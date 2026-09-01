import { Router, Request, Response } from "express";
import Schedule from "../models/schedule";
import authMiddleware from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const schedule = await Schedule.find({
        userId,
      }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        schedule,
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
        day,
        date,
        time,
        period,
        course,
        code,
        instructor,
        room,
        color,
      } = req.body;

      if (!day || !date || !time || !course || !code) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
        });
      }

      const item = await Schedule.create({
        userId,
        day,
        date,
        time,
        period: period || "AM",
        course,
        code,
        instructor: instructor || "Instructor",
        room: room || "TBA",
        color: color || "purple",
      });

      return res.status(201).json({
        success: true,
        schedule: item,
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

      const item = await Schedule.findOneAndUpdate(
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

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Schedule item not found",
        });
      }

      return res.json({
        success: true,
        schedule: item,
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

      const item = await Schedule.findOneAndDelete({
        _id: req.params.id,
        userId,
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Schedule item not found",
        });
      }

      return res.json({
        success: true,
        message: "Schedule deleted successfully",
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