import * as dao from "./dao.js";
import asyncHandler from "../middleware/asyncHandler.js";
import requireRole, { requireSignin } from "../middleware/requireRole.js";

// Which option is right is the one thing a quiz must not hand to the person
// taking it. Hiding the answers in the client is not hiding them: the response
// is one devtools tab away. So the fields leave the server only for staff.
//
// This strips on the way out rather than querying differently, because the
// question editor reads the same route and does need the full document.
const withoutAnswers = (question) => {
  const { correctAnswers, choices, ...rest } = question.toObject();
  return {
    ...rest,
    choices: (choices || []).map(({ isCorrect, ...choice }) => choice),
  };
};

const canSeeAnswers = (user) => user?.role === "FACULTY" || user?.role === "ADMIN";

export default function QuizRoutes(app) {
  const requireStaff = requireRole("FACULTY", "ADMIN");

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
    if (canSeeAnswers(req.session["currentUser"])) {
      res.json(questions);
      return;
    }
    res.json(questions.map(withoutAnswers));
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


  app.get("/api/quizzes", requireSignin, asyncHandler(findAllQuizzes));
  app.get("/api/courses/:cid/quizzes", requireSignin, asyncHandler(findQuizzesForCourse));
  app.get("/api/quizzes/:qid", requireSignin, asyncHandler(findQuizById));
  app.post("/api/courses/:cid/quizzes", requireStaff, asyncHandler(createQuiz));
  app.put("/api/quizzes/:qid", requireStaff, asyncHandler(updateQuiz));
  app.delete("/api/quizzes/:qid", requireStaff, asyncHandler(deleteQuiz));

  // Signed in to read, but the handler decides how much of each question the
  // caller is allowed to see.
  app.get("/api/quizzes/:qid/questions", requireSignin, asyncHandler(findQuestionsForQuiz));
  app.post("/api/quizzes/:qid/questions", requireStaff, asyncHandler(createQuestion));
  app.put("/api/questions/:questionId", requireStaff, asyncHandler(updateQuestion));
  app.delete("/api/questions/:questionId", requireStaff, asyncHandler(deleteQuestion));
}

