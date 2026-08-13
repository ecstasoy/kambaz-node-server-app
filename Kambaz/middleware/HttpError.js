// An error that carries the HTTP status it should be reported as, so route
// handlers can reject a request from anywhere in the call stack without
// needing the `res` object. Anything thrown that is not an HttpError and not a
// recognized database error is treated as a bug and reported as a 500.
export default class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
