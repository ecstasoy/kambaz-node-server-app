import mongoose from "mongoose";
import questionSchema from "./questionsSchema.js";

const QuestionModel = mongoose.model("QuestionModel", questionSchema);

export default QuestionModel;

