import mongoose, { Document, Schema } from "mongoose";

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  day: string;
  date: string;
  time: string;
  period: "AM" | "PM";
  course: string;
  code: string;
  instructor: string;
  room: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    day: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    period: {
      type: String,
      enum: ["AM", "PM"],
      default: "AM",
    },

    course: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    instructor: {
      type: String,
      default: "Instructor",
    },

    room: {
      type: String,
      default: "TBA",
    },

    color: {
      type: String,
      default: "purple",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISchedule>(
  "Schedule",
  scheduleSchema
);