import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizModel' },
  title: String,
  type: {
    type: String,
    enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_BLANK"],
    default: "MULTIPLE_CHOICE"
  },
  points: { type: Number, default: 0 },
  question: String, // The actual question text (HTML/WYSIWYG content)
  choices: [
    {
      text: String,
      isCorrect: Boolean
    }
  ],
  // For Fill in the blank, we might store possible correct answers differently
  correctAnswers: [String], 
  
}, { collection: "questions" });

export default questionSchema;

