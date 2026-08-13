// Wraps an async route handler so that a rejected promise is handed to Express's
// error middleware instead of becoming an unhandled rejection. Express 4 only
// forwards errors thrown synchronously, so without this an `await` that rejects
// leaves the request hanging until the client times out. (Express 5 does this
// on its own, at which point this wrapper can be dropped.)
export default function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
