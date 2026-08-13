import UsersDao from "./dao.js";
import EnrollmentsDao from "../Enrollments/dao.js";
import asyncHandler from "../middleware/asyncHandler.js";
import requireRole, { requireSignin, requireSelfOrRole } from "../middleware/requireRole.js";
import HttpError from "../middleware/HttpError.js";
import publicUser from "./publicUser.js";

export default function UserRoutes(app, db) {
  const dao = UsersDao(db);
  const enrollmentsDao = EnrollmentsDao(db);
  
  // create returns the document we just built in memory, which still holds the
  // hash the schema's select: false would have filtered out of a query.
  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(publicUser(user));
  };
  
  const deleteUser = async (req, res) => {
    const { userId } = req.params;
    await dao.deleteUser(userId);
    res.sendStatus(200);
  };
  
  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }
    const users = await dao.findAllUsers();
    res.json(users);
  };
  
  const findUserById = async (req, res) => {
    const { userId } = req.params;
    const user = await dao.findUserById(userId);
    res.json(user);
  };
  
  const findUsersForCourse = async (req, res) => {
    const { courseId } = req.params;
    const users = await enrollmentsDao.findUsersForCourse(courseId);
    res.json(users);
  };
  
  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    // Self-update is allowed, so without this a student could PUT their own
    // record with role: "ADMIN" and grant themselves everything the gates
    // below are meant to withhold. Only an admin may set a role.
    const actor = req.session["currentUser"];
    if (userUpdates.role !== undefined && actor.role !== "ADMIN") {
      const target = await dao.findUserById(userId);
      if (userUpdates.role !== target?.role) {
        throw new HttpError(403, "Only an admin can change a role");
      }
    }
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      // publicUser here too: userUpdates arrived from the client and may carry
      // a plaintext password, which must not be merged into the session.
      req.session["currentUser"] = publicUser({ ...currentUser, ...userUpdates });
    }
    res.json(req.session["currentUser"]);
  };
  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = publicUser(await dao.createUser(req.body));
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };

  const signin = async (req, res) => {
    const { username, password } = req.body;
    const found = await dao.findUserByCredentials(username, password);
    if (found) {
      // findUserByCredentials selected the hash back in to compare it; it stops
      // here rather than going into the session and out to the client.
      const currentUser = publicUser(found);
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };
  
  const signout = async (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };
  
  const profile = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };
  
  // Public: the entry points you need before you have a session, plus profile,
  // which is how the client asks "am I signed in?" and answers 401 by design.
  app.post("/api/users/signup", asyncHandler(signup));
  app.post("/api/users/signin", asyncHandler(signin));
  app.post("/api/users/signout", asyncHandler(signout));
  app.post("/api/users/profile", asyncHandler(profile));

  // Administering other people's accounts.
  app.post("/api/users", requireRole("ADMIN"), asyncHandler(createUser));
  app.get("/api/users", requireRole("ADMIN"), asyncHandler(findAllUsers));
  app.delete("/api/users/:userId", requireRole("ADMIN"), asyncHandler(deleteUser));

  // Reading and editing your own account; an admin may do it for anyone.
  app.get("/api/users/:userId", requireSelfOrRole("userId", "ADMIN"), asyncHandler(findUserById));
  app.put("/api/users/:userId", requireSelfOrRole("userId", "ADMIN"), asyncHandler(updateUser));

  app.get("/api/courses/:courseId/users", requireSignin, asyncHandler(findUsersForCourse));
}
