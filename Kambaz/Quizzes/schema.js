import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: String,
  course: { type: String, ref: "CourseModel" },
  description: String,
  points: Number,
  dueDate: String,
  availableDate: String,
  untilDate: String,
  published: { type: Boolean, default: false },
  timeLimit: { type: Number, default: 20 }, // in minutes
  shuffleAnswers: { type: Boolean, default: true },
  showCorrectAnswers: { type: Boolean, default: true }, // Whether to show correct answers after submission
  accessCode: { type: String, default: "" },
  oneQuestionAtATime: { type: Boolean, default: true },
  webcamRequired: { type: Boolean, default: false },
  lockQuestionsAfterAnswering: { type: Boolean, default: false },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionModel'
  }]
}, { collection: "quizzes" });

export default quizSchema;

