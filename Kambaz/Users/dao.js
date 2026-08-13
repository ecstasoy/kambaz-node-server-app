import model from "./model.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

// Cost factor. Each increment doubles the work to hash and to verify, which is
// the point: it is what makes a stolen database expensive to crack. 12 is a
// few hundred milliseconds on current hardware -- unnoticeable on a login,
// ruinous at the scale an attacker needs.
const HASH_ROUNDS = 12;

// A valid hash of nothing in particular, compared against when no such user
// exists so that a wrong username costs the same time as a wrong password.
// Without it, response time tells an attacker which usernames are real.
const DUMMY_HASH = bcrypt.hashSync("no such user", HASH_ROUNDS);

export default function UsersDao(db) {
  let { users } = db;
  const createUser = async (user) => {
    const newUser = {
      ...user,
      _id: uuidv4(),
      // Leave a missing password alone so the schema's `required` validator
      // reports it as a 400, rather than bcrypt throwing a 500 first.
      password: user.password ? await bcrypt.hash(user.password, HASH_ROUNDS) : user.password,
    };
    return model.create(newUser);
  };
  const findAllUsers = () => model.find();
  const findUserById = (userId) => model.findById(userId);
  const findUserByUsername = (username) => model.findOne({ username: username });
  // Passwords can no longer be matched in the query -- the same password hashes
  // differently every time, because the salt is random. Look the user up, then
  // let bcrypt re-derive the hash from the candidate and compare in constant
  // time. Returns null rather than throwing so the route keeps deciding what a
  // failed sign-in looks like.
  const findUserByCredentials = async (username, password) => {
    const user = await model.findOne({ username }).select("+password");
    const matches = await bcrypt.compare(password ?? "", user?.password ?? DUMMY_HASH);
    return user && matches ? user : null;
  };

  const updateUser = async (userId, user) => {
    const updates = { ...user };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, HASH_ROUNDS);
    } else {
      // The profile form submits every field, so a blank password box means
      // "leave it as it is" -- not "set my password to empty".
      delete updates.password;
    }
    return model.updateOne({ _id: userId }, { $set: updates });
  };
  const deleteUser = (userId) => model.findByIdAndDelete(userId);
  
  const findUsersByRole = (role) => model.find({ role: role });
  
  const findUsersByPartialName = (partialName) => {
    const regex = new RegExp(partialName, "i");
    return model.find({
      $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
    });
  };
  
  return { 
    createUser, 
    findAllUsers, 
    findUserById, 
    findUserByUsername, 
    findUserByCredentials, 
    updateUser, 
    deleteUser,
    findUsersByRole,
    findUsersByPartialName,
  };
}
