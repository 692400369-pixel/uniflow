import express, {
  Request,
  Response,
  NextFunction,
} from "express";

import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

/* =========================
   ROUTES
========================= */

import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import courseRouter from "./routes/course";
import assignmentsRouter from "./routes/assignments";
import goalsRouter from "./routes/goals";
import gpaRouter from "./routes/gpa";
import scheduleRouter from "./routes/schedule";

/* =========================
   ENV
========================= */

dotenv.config();

/* =========================
   APP
========================= */

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* =========================
   BASIC TEST ROUTE
========================= */

app.get(
  "/",
  (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: "UniFlow Backend is running 🚀",
    });
  }
);

/* =========================
   AUTH
========================= */

app.use(
  "/api/auth",
  authRouter
);

/* =========================
   USERS
========================= */

app.use(
  "/api/users",
  userRouter
);

/* =========================
   COURSES
========================= */

app.use(
  "/api/courses",
  courseRouter
);

/* =========================
   ASSIGNMENTS
========================= */

app.use(
  "/api/assignments",
  assignmentsRouter
);

/* =========================
   GOALS
========================= */

app.use(
  "/api/goals",
  goalsRouter
);

/* =========================
   GPA
========================= */

app.use(
  "/api/gpa",
  gpaRouter
);

/* =========================
   SCHEDULE
========================= */

app.use(
  "/api/schedule",
  scheduleRouter
);

/* =========================
   404
========================= */

app.use(
  (
    req: Request,
    res: Response
  ) => {
    return res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  }
);

/* =========================
   ERROR HANDLER
========================= */

app.use(
  (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(
      "Server Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

/* =========================
   SERVER CONFIG
========================= */

const PORT =
  Number(
    process.env.PORT
  ) || 5000;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/uniflow";

/* =========================
   START SERVER
========================= */

async function startServer(): Promise<void> {
  try {

    /* =====================
       CONNECT MONGODB
    ===================== */

    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "✅ MongoDB connected successfully"
    );

    /* =====================
       START EXPRESS
    ===================== */

    app.listen(
      PORT,
      () => {

        console.log(
          `🚀 UniFlow Backend running on http://localhost:${PORT}`
        );

        console.log(
          `🔐 Auth: http://localhost:${PORT}/api/auth`
        );

        console.log(
          `👤 Users: http://localhost:${PORT}/api/users`
        );

        console.log(
          `📚 Courses: http://localhost:${PORT}/api/courses`
        );

        console.log(
          `📝 Assignments: http://localhost:${PORT}/api/assignments`
        );

        console.log(
          `🎯 Goals: http://localhost:${PORT}/api/goals`
        );

        console.log(
          `📊 GPA: http://localhost:${PORT}/api/gpa`
        );

        console.log(
          `📅 Schedule: http://localhost:${PORT}/api/schedule`
        );

      }
    );

  } catch (error) {

    console.error(
      "❌ Failed to start server:",
      error
    );

    process.exit(1);

  }
}

/* =========================
   RUN
========================= */

startServer();