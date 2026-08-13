// Maps a thrown error onto the status code and message the client should see.
// Only errors we recognize get to describe themselves; everything else is an
// unexpected failure, so it is logged server-side and reported as a bare 500
// rather than leaking a stack trace or an internal message.
function describe(err) {
  // HttpError, and body-parser failures from express.json() (a SyntaxError
  // that already carries status 400).
  const declared = err.status || err.statusCode;
  if (declared >= 400 && declared < 600) {
    return { status: declared, message: err.message };
  }
  // Mongoose could not cast a value to its schema type — almost always an
  // :id path parameter that is not a valid ObjectId.
  if (err.name === "CastError") {
    return { status: 400, message: `Invalid value for "${err.path}"` };
  }
  // Mongoose schema validation: required, enum, min/max, ...
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return { status: 400, message: details.join("; ") };
  }
  // MongoDB unique index violation, e.g. a username that is already taken.
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(", ");
    return { status: 409, message: `Already taken: ${fields}` };
  }
  return { status: 500, message: "Internal server error" };
}

// Runs when no route matched. Without it Express replies with an HTML page,
// which a JSON client cannot parse.
export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
};

// Must be registered last, and must take four arguments — that is how Express
// tells error middleware apart from ordinary middleware.
export default function errorHandler(err, req, res, next) {
  // The response is already on the wire, so there is no status left to set.
  // Express's default handler knows how to abort the connection.
  if (res.headersSent) {
    return next(err);
  }
  const { status, message } = describe(err);
  if (status >= 500) {
    console.error(`${req.method} ${req.path} failed:`, err);
  }
  res.status(status).json({ message });
}
