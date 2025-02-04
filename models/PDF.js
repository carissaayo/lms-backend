import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    sizeInKB: { type: String, required: true },
    sizeInMB: { type: String, required: true },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["instructor", "student"],
    },
    fileFolder: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const PDF = mongoose.model("pdf", pdfSchema);

export default PDF;
