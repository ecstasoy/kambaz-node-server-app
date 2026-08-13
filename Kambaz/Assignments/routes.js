import AssignmentsDao from "./dao.js";
import asyncHandler from "../middleware/asyncHandler.js";
import requireRole, { requireSignin } from "../middleware/requireRole.js";

export default function AssignmentsRoutes(app, db) {
  const dao = AssignmentsDao(db);
  
  const findAssignmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignments = await dao.findAssignmentsForCourse(courseId);
    res.json(assignments);
  };
  
  const createAssignmentForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignment = {
      ...req.body,
      course: courseId,
    };
    const newAssignment = await dao.createAssignment(assignment);
    res.json(newAssignment);
  };
  
  const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    await dao.deleteAssignment(assignmentId);
    res.sendStatus(200);
  };
  
  const updateAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const assignmentUpdates = req.body;
    await dao.updateAssignment(assignmentId, assignmentUpdates);
    res.sendStatus(200);
  };
  
  const requireStaff = requireRole("FACULTY", "ADMIN");

  app.get("/api/courses/:courseId/assignments", requireSignin, asyncHandler(findAssignmentsForCourse));
  app.post("/api/courses/:courseId/assignments", requireStaff, asyncHandler(createAssignmentForCourse));
  app.delete("/api/assignments/:assignmentId", requireStaff, asyncHandler(deleteAssignment));
  app.put("/api/assignments/:assignmentId", requireStaff, asyncHandler(updateAssignment));
}
