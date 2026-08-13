import { v4 as uuidv4 } from "uuid";
import model from "../Courses/model.js";

export default function ModulesDao(db) {
  async function createModule(courseId, module) {
    const newModule = { ...module, _id: uuidv4() };
    const status = await model.updateOne(
      { _id: courseId },
      { $push: { modules: newModule } }
    );
    return newModule;
  }
  
  async function findModulesForCourse(courseId) {
    const course = await model.findById(courseId);
    return course?.modules || [];
  }
  
  async function deleteModule(courseId, moduleId) {
    const status = await model.updateOne(
      { _id: courseId },
      { $pull: { modules: { _id: moduleId } } }
    );
    return status;
  }
  
  async function updateModule(courseId, moduleId, moduleUpdates) {
    const course = await model.findById(courseId);
    // An unknown course or module used to blow up on a null dereference here,
    // which the client saw as a 500. Report it as "no such module" instead and
    // let the route turn that into a 404.
    const module = course?.modules.id(moduleId);
    if (!module) {
      return null;
    }
    Object.assign(module, moduleUpdates);
    await course.save();
    return module;
  }
  
  return {
    createModule,
    findModulesForCourse,
    deleteModule,
    updateModule,
  };
}
