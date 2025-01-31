import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: "string",
    required: true,
  },
  points: {
    type: Number,
    default: 1,
  },
  options: [{ type: String }], // Array of options for multiple-choice questions
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be a value, index, or text
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "short-answer"],
    required: true,
  },
});

export default questionSchema;
