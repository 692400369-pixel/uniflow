import mongoose, { Document, Schema } from "mongoose";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category:
    | "Development"
    | "Study"
    | "Learning"
    | "Academic";
  deadline: string;
  progress: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Development",
        "Study",
        "Learning",
        "Academic",
      ],
      default: "Study",
    },

    deadline: {
      type: String,
      required: true,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGoal>(
  "Goal",
  goalSchema
);