import { Router, Request, Response } from "express";
import GPACourse from "../models/gpa";
import authMiddleware from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const courses = await GPACourse.find({
        userId,
      }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        courses,
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
        name,
        credit,
        grade,
      } = req.body;

      if (!name || credit === undefined || !grade) {
        return res.status(400).json({
          success: false,
          message: "Name, credit and grade are required",
        });
      }

      const course = await GPACourse.create({
        userId,
        name,
        credit,
        grade,
      });

      return res.status(201).json({
        success: true,
        course,
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

      const course = await GPACourse.findOneAndUpdate(
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

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "GPA course not found",
        });
      }

      return res.json({
        success: true,
        course,
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

      const course = await GPACourse.findOneAndDelete({
        _id: req.params.id,
        userId,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "GPA course not found",
        });
      }

      return res.json({
        success: true,
        message: "GPA course deleted successfully",
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