// models/Rating.js
import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      required: true,
      maxlength: [500, "Review cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// Indexes for better performance
RatingSchema.index({ courseId: 1, user: 1 }, { unique: true }); // Prevent duplicate ratings
RatingSchema.index({ courseId: 1, rating: -1 });
RatingSchema.index({ user: 1 });
RatingSchema.index({ createdAt: -1 });

const Rating = mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
export default Rating;