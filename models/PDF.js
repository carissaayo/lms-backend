import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    sizeInKB: { type: String, required: true },
    sizeInMB: { type: String, required: true },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
