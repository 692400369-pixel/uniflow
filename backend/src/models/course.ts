import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  progress: number;
  icon: string;
  color: string;
}

const courseSchema = new Schema<ICourse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    instructor: {
      type: String,
      default: "Instructor",
      trim: true,
    },

    schedule: {
      type: String,
      default: "TBA",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    icon: {
      type: String,
      default: "CR",
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

export default mongoose.model<ICourse>("Course", courseSchema);