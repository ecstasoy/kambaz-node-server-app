import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  _id: String,
  title: String,
  course: { type: String, ref: "CourseModel" },
  description: String,
  points: Number,
  dueDate: String,
  availableFrom: String,
  availableUntil: String,
  type: {
    type: String,
    enum: ["assignment", "quiz", "exam", "project"],
    default: "assignment"
  }
}, { collection: "assignments" });

export default assignmentSchema;
