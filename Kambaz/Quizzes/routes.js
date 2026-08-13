import * as dao from "./dao.js";
import asyncHandler from "../middleware/asyncHandler.js";

export default function QuizRoutes(app) {
  const findAllQuizzes = async (req, res) => {
    const quizzes = await dao.findAllQuizzes();
    res.json(quizzes);
  };
  
  const findQuizzesForCourse = async (req, res) => {
    const { cid } = req.params;
    const quizzes = await dao.findQuizzesForCourse(cid);
    res.json(quizzes);
  };

  const findQuizById = async (req, res) => {
    const { qid } = req.params;
    const quiz = await dao.findQuizById(qid);
    res.json(quiz);
  };

  const createQuiz = async (req, res) => {
    const { cid } = req.params;
    const quiz = { ...req.body, course: cid };
    const newQuiz = await dao.createQuiz(quiz);
    res.json(newQuiz);
  };

  const updateQuiz = async (req, res) => {
    const { qid } = req.params;
    const status = await dao.updateQuiz(qid, req.body);
    res.json(status);
  };

  const deleteQuiz = async (req, res) => {
    const { qid } = req.params;
    const status = await dao.deleteQuiz(qid);
    res.json(status);
  };

  // Questions Routes
  const findQuestionsForQuiz = async (req, res) => {
    const { qid } = req.params;
    const questions = await dao.findQuestionsForQuiz(qid);
    res.json(questions);
  };

  const createQuestion = async (req, res) => {
    const { qid } = req.params;
    const question = req.body;
    const newQuestion = await dao.createQuestion(qid, question);
    res.json(newQuestion);
  };

  const updateQuestion = async (req, res) => {
      const { questionId } = req.params;
      const status = await dao.updateQuestion(questionId, req.body);
      res.json(status);
  };

  const deleteQuestion = async (req, res) => {
      const { questionId } = req.params;
      const status = await dao.deleteQuestion(questionId);
      res.json(status);
  };


  app.get("/api/quizzes", asyncHandler(findAllQuizzes));
  app.get("/api/courses/:cid/quizzes", asyncHandler(findQuizzesForCourse));
  app.get("/api/quizzes/:qid", asyncHandler(findQuizById));
  app.post("/api/courses/:cid/quizzes", asyncHandler(createQuiz));
  app.put("/api/quizzes/:qid", asyncHandler(updateQuiz));
  app.delete("/api/quizzes/:qid", asyncHandler(deleteQuiz));

  app.get("/api/quizzes/:qid/questions", asyncHandler(findQuestionsForQuiz));
  app.post("/api/quizzes/:qid/questions", asyncHandler(createQuestion));
  app.put("/api/questions/:questionId", asyncHandler(updateQuestion));
  app.delete("/api/questions/:questionId", asyncHandler(deleteQuestion));
}

