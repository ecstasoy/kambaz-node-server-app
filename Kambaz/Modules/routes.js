import ModulesDao from "./dao.js";
import asyncHandler from "../middleware/asyncHandler.js";
import HttpError from "../middleware/HttpError.js";
import requireRole, { requireSignin } from "../middleware/requireRole.js";

export default function ModulesRoutes(app, db) {
  const dao = ModulesDao(db);
  
  const findModulesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const modules = await dao.findModulesForCourse(courseId);
    res.json(modules);
  };
  
  const createModuleForCourse = async (req, res) => {
    const { courseId } = req.params;
    const module = {
      ...req.body,
    };
    const newModule = await dao.createModule(courseId, module);
    res.json(newModule);
  };
  
  const deleteModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const status = await dao.deleteModule(courseId, moduleId);
    res.json(status);
  };
  
  const updateModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const moduleUpdates = req.body;
    const updatedModule = await dao.updateModule(courseId, moduleId, moduleUpdates);
    if (!updatedModule) {
      throw new HttpError(404, "No such module in this course");
    }
    res.json(updatedModule);
  };
  
  const requireStaff = requireRole("FACULTY", "ADMIN");

  app.get("/api/courses/:courseId/modules", requireSignin, asyncHandler(findModulesForCourse));
  app.post("/api/courses/:courseId/modules", requireStaff, asyncHandler(createModuleForCourse));
  app.delete("/api/courses/:courseId/modules/:moduleId", requireStaff, asyncHandler(deleteModule));
  app.put("/api/courses/:courseId/modules/:moduleId", requireStaff, asyncHandler(updateModule));
}
