import { Router, Request, Response } from "express";
import Course from "../models/course";
import authMiddleware from "../middleware/auth";

const router = Router();

/* =========================
   GET ALL COURSES
========================= */

router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const courses = await Course.find({
        userId,
      }).sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      console.error("Get courses error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/* =========================
   CREATE COURSE
========================= */

router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const {
        name,
        code,
        instructor,
        schedule,
        progress,
        icon,
        color,
      } = req.body;

      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: "Course name and code are required",
        });
      }

      const course = await Course.create({
        userId,
        name,
        code,
        instructor: instructor || "Instructor",
        schedule: schedule || "TBA",
        progress: progress ?? 0,
        icon:
          icon ||
          code
            .trim()
            .substring(0, 3)
            .toUpperCase(),
        color: color || "purple",
      });

      return res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      console.error("Create course error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/* =========================
   UPDATE COURSE
========================= */

router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const course = await Course.findOneAndUpdate(
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
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course,
      });
    } catch (error) {
      console.error("Update course error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/* =========================
   DELETE COURSE
========================= */

router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const course = await Course.findOneAndDelete({
        _id: req.params.id,
        userId,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error("Delete course error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;