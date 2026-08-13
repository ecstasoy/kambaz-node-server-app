import HttpError from "./HttpError.js";

// Authorization gates, applied at the route table so that what a route requires
// is visible next to the route itself. The client hides controls a user may not
// use, but that is only presentation -- these are what actually decide.
//
// 401 means "we do not know who you are", 403 means "we do, and the answer is
// no". Sending 403 for both would tell an anonymous caller to give up when
// signing in would have worked.

const signedInUser = (req) => {
  const currentUser = req.session["currentUser"];
  if (!currentUser) {
    throw new HttpError(401, "Not signed in");
  }
  return currentUser;
};

// requireRole() with no arguments admits any signed-in user.
export default function requireRole(...roles) {
  return (req, res, next) => {
    const currentUser = signedInUser(req);
    if (roles.length > 0 && !roles.includes(currentUser.role)) {
      throw new HttpError(403, "Not allowed");
    }
    next();
  };
}

export const requireSignin = requireRole();

// For routes addressed to a particular user, where acting on yourself is always
// allowed and acting on someone else takes a role. `param` names the path
// parameter holding the target user id; the literal "current" is the caller.
export function requireSelfOrRole(param, ...roles) {
  return (req, res, next) => {
    const currentUser = signedInUser(req);
    const target = req.params[param];
    if (target === "current" || target === currentUser._id) {
      return next();
    }
    if (roles.includes(currentUser.role)) {
      return next();
    }
    throw new HttpError(403, "Not allowed");
  };
}
