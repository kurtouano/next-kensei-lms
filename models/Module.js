// models/Module.js - Simplified schema using MongoDB's _id
import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    courseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    quiz: {
      title: String,
      questions: [
        {
          // MongoDB automatically creates _id for each question
          type: {
            type: String,
            enum: ["multiple_choice", "fill_in_blanks", "matching"],
            default: "multiple_choice",
            required: true
          },
          question: {
            type: String,
            required: true,
          },
          points: {
            type: Number,
            default: 1,
            min: 1,
            max: 10
          },
          // Multiple Choice Fields
          options: [
            {
              text: {
                type: String,
                required: function() {
                  return this.parent().type === "multiple_choice"
                }
              },
              isCorrect: {
                type: Boolean,
                required: function() {
                  return this.parent().type === "multiple_choice"
                }
              },
            },
          ],
          // Fill in the Blanks Fields
          blanks: [
            {
              answer: {
                type: String,
                required: function() {
                  return this.parent().type === "fill_in_blanks"
                }
              },
              alternatives: [{
                type: String
              }]
            }
          ],
          // Matching Fields
          pairs: [
            {
              left: {
                type: String,
                required: function() {
                  return this.parent().type === "matching"
                }
              },
              right: {
                type: String,
                required: function() {
                  return this.parent().type === "matching"
                }
              },
              points: {
                type: Number,
                default: 1,
                min: 1,
                max: 5
              }
            }
          ]
        },
      ],
    },
  },
  { timestamps: true }
);

// Add indexes for better performance
ModuleSchema.index({ courseRef: 1, order: 1 });

const Module = mongoose.models.Module || mongoose.model("Module", ModuleSchema);
export default Module;