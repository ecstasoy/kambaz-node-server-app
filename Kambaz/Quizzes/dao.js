import QuizModel from "./model.js";
import QuestionModel from "./questionsModel.js";

// Quiz DAO
export const createQuiz = (quiz) => {
  delete quiz._id;
  return QuizModel.create(quiz);
}

export const findAllQuizzes = () => QuizModel.find();

export const findQuizzesForCourse = (courseId) => QuizModel.find({ course: courseId });

export const findQuizById = (quizId) => QuizModel.findById(quizId);

export const updateQuiz = (quizId, quiz) => QuizModel.updateOne({ _id: quizId }, { $set: quiz });

export const deleteQuiz = (quizId) => QuizModel.deleteOne({ _id: quizId });


// Question DAO
export const createQuestion = (quizId, question) => {
    delete question._id;
    question.quizId = quizId;
    return QuestionModel.create(question);
}

export const findQuestionsForQuiz = (quizId) => QuestionModel.find({ quizId: quizId });

export const findQuestionById = (questionId) => QuestionModel.findById(questionId);

export const updateQuestion = (questionId, question) => QuestionModel.updateOne({ _id: questionId }, { $set: question });

export const deleteQuestion = (questionId) => QuestionModel.deleteOne({ _id: questionId });

