// The password hash must never leave the server.
//
// The schema's `select: false` already keeps it out of query results, but a
// document we just created or updated in memory still carries it, and the
// session is serialized straight from one of those. Everything that becomes a
// response body or a session value goes through here.
export default function publicUser(user) {
  if (!user) {
    return user;
  }
  const { password, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
}
