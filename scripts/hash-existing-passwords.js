// One-off migration: replace stored plaintext passwords with bcrypt hashes.
//
// Sign-in used to be `findOne({ username, password })`, so every existing row
// holds a plaintext password. bcrypt.compare against plaintext never matches,
// which would lock out every existing account the moment the new code ships.
// Run this once, against the same database, before or during that deploy:
//
//   DATABASE_CONNECTION_STRING=... node scripts/hash-existing-passwords.js
//
// It is safe to run more than once: a value that already looks like a bcrypt
// hash is left alone, so a partial run can simply be repeated.
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userSchema from "../Kambaz/Users/schema.js";

const HASH_ROUNDS = 12;
// bcrypt output is always "$2<variant>$<cost>$<22 char salt><31 char digest>".
const BCRYPT_HASH = /^\$2[aby]?\$\d{2}\$.{53}$/;

const CONNECTION_STRING =
  process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";

await mongoose.connect(CONNECTION_STRING);
const User = mongoose.model("UserModel", userSchema);

// The schema marks password select: false, so ask for it explicitly.
const users = await User.find().select("+password");

let hashed = 0;
let alreadyHashed = 0;
let missing = 0;

for (const user of users) {
  if (!user.password) {
    missing += 1;
    continue;
  }
  if (BCRYPT_HASH.test(user.password)) {
    alreadyHashed += 1;
    continue;
  }
  await User.updateOne(
    { _id: user._id },
    { $set: { password: await bcrypt.hash(user.password, HASH_ROUNDS) } }
  );
  hashed += 1;
}

console.log(
  `${users.length} users: ${hashed} hashed, ${alreadyHashed} already hashed, ${missing} with no password`
);

await mongoose.disconnect();
