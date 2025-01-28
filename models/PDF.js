import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    file: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  },
  { timestamps: true }
);
const PDF = mongoose.model("pdf", pdfSchema);

export default PDF;
