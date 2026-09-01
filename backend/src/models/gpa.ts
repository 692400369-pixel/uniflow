import mongoose, { Document, Schema } from "mongoose";

export interface IGPACourse extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  credit: number;
  grade: string;
  createdAt: Date;
  updatedAt: Date;
}

const gpaSchema = new Schema<IGPACourse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    credit: {
      type: Number,
      required: true,
      min: 0,
    },

    grade: {
      type: String,
      required: true,
      enum: [
        "A+",
        "A",
        "A-",
        "B+",
        "B",
        "B-",
        "C+",
        "C",
        "C-",
        "D+",
        "D",
        "F",
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGPACourse>(
  "GPACourse",
  gpaSchema
);