import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: String,
    username: { type: String, required: true, unique: true },
    // select: false keeps the hash out of every query that does not ask for it
    // by name, so a new route cannot leak it by forgetting to. Only
    // findUserByCredentials opts back in, with .select("+password").
    password: { type: String, required: true, select: false },
    firstName: String,
    email: String,
    lastName: String,
    dob: Date,
    role: {
      type: String,
      enum: ["STUDENT", "FACULTY", "ADMIN", "USER"],
      default: "USER",
    },
    loginId: String,
    section: String,
    lastActivity: Date,
    totalActivity: String,
  },
  { collection: "users" }
);

export default userSchema;

