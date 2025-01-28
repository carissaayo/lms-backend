import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    video: {
      url: {
        type: String,
        required: true,
      },
      caption: { type: String },
      format: { type: String, required: true },
      sizeInKB: { type: String, required: true },
      sizeInMB: { type: String, required: true },
      originalName: { type: String, required: true },
    },
    notes: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: { type: String },
        format: { type: String, required: true },
        sizeInKB: { type: String, required: true },
        sizeInMB: { type: String, required: true },
        originalName: { type: String, required: true },
      },
    ],
    duration: {
      type: Number,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
