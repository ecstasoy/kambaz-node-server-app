import "dotenv/config";
import express from 'express'
import mongoose from "mongoose";
import session from "express-session";
import Hello from "./Hello.js"
import Lab5 from "./Lab5/index.js";
import cors from "cors";
import db from "./Kambaz/Database/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentsRoutes from "./Kambaz/Assignments/routes.js";
import QuizRoutes from "./Kambaz/Quizzes/routes.js";
import errorHandler, { notFoundHandler } from "./Kambaz/middleware/errorHandler.js";

const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz"
mongoose.connect(CONNECTION_STRING);

const app = express()
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};
if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
  };
}
app.use(session(sessionOptions));
app.use(express.json());
UserRoutes(app, db);
CourseRoutes(app, db);
ModulesRoutes(app, db);
AssignmentsRoutes(app, db);
QuizRoutes(app);
Lab5(app)
Hello(app)
// Both must come after every route: the first catches URLs nothing matched,
// the second catches errors anything ahead of it passed to next().
app.use(notFoundHandler);
app.use(errorHandler);
app.listen(process.env.PORT || 4000)