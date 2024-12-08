const findUserByEmail = "SELECT * FROM appuser WHERE email=$1";
const registerUser =
  "INSERT INTO appuser (email, password, user_name) VALUES($1, $2, $3) returning *";

module.exports = {
  findUserByEmail,
  registerUser,
};
