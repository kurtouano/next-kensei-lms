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
          question: {
            type: String,
            required: true,
          },
          options: [
            {
              text: {
                type: String,
                required: true,
              },
              isCorrect: {
                type: Boolean,
                required: true,
              },
            },
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

const Module = mongoose.models.Module || mongoose.model("Module", ModuleSchema);
export default Module;
