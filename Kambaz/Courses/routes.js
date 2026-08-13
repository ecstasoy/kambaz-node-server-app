import CoursesDao from "./dao.js";
import EnrollmentsDao from "../Enrollments/dao.js";
import asyncHandler from "../middleware/asyncHandler.js";
import HttpError from "../middleware/HttpError.js";
import requireRole, { requireSignin, requireSelfOrRole } from "../middleware/requireRole.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao(db);
  const enrollmentsDao = EnrollmentsDao(db);

  // Every route below that resolves "current" needs a signed-in user. Reading
  // the session without checking turned a missing session into a TypeError on
  // `currentUser._id`, which surfaced as a 500 instead of a 401.
  const currentUserOrFail = (req) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      throw new HttpError(401, "Not signed in");
    }
    return currentUser;
  };

  const findAllCourses = async (req, res) => {
    const courses = await dao.findAllCourses();
    res.json(courses);
  };
  
  const findCoursesForEnrolledUser = async (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      userId = currentUserOrFail(req)._id;
    }
    const courses = await enrollmentsDao.findCoursesForUser(userId);
    res.json(courses);
  };
  
  const createCourse = async (req, res) => {
    const currentUser = currentUserOrFail(req);
    const newCourse = await dao.createCourse(req.body);
    await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };
  
  const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    await enrollmentsDao.unenrollAllUsersFromCourse(courseId);
    const status = await dao.deleteCourse(courseId);
    res.json(status);
  };
  
  const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const courseUpdates = req.body;
    const status = await dao.updateCourse(courseId, courseUpdates);
    res.json(status);
  };
  
  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      uid = currentUserOrFail(req)._id;
    }
    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.json(status);
  };
  
  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      uid = currentUserOrFail(req)._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.json(status);
  };
  
  const findUsersForCourse = async (req, res) => {
    const { cid } = req.params;
    const users = await enrollmentsDao.findUsersForCourse(cid);
    res.json(users);
  };
  
  app.get("/api/courses", requireSignin, asyncHandler(findAllCourses));
  app.get("/api/courses/:cid/users", requireSignin, asyncHandler(findUsersForCourse));
  app.get("/api/users/:userId/courses", requireSelfOrRole("userId", "FACULTY", "ADMIN"), asyncHandler(findCoursesForEnrolledUser));

  // Authoring a course.
  app.post("/api/users/current/courses", requireRole("FACULTY", "ADMIN"), asyncHandler(createCourse));
  app.delete("/api/courses/:courseId", requireRole("FACULTY", "ADMIN"), asyncHandler(deleteCourse));
  app.put("/api/courses/:courseId", requireRole("FACULTY", "ADMIN"), asyncHandler(updateCourse));

  // Enrolling yourself is ordinary; enrolling somebody else is a staff action.
  app.post("/api/users/:uid/courses/:cid", requireSelfOrRole("uid", "FACULTY", "ADMIN"), asyncHandler(enrollUserInCourse));
  app.delete("/api/users/:uid/courses/:cid", requireSelfOrRole("uid", "FACULTY", "ADMIN"), asyncHandler(unenrollUserFromCourse));
}
