const findUserBroker = "SELECT * FROM broker WHERE user_id=$1";
const findBroker = "SELECT * FROM broker WHERE broker_name=$1 AND user_id=$2";
const addBroker =
  "INSERT INTO broker (broker_name, user_id) VALUES($1, $2) RETURNING *";
const updateBroker =
  "UPDATE broker SET broker_name = $1 WHERE broker_id = $2 RETURNING *";
const deleteBroker = "DELETE FROM broker WHERE broker_id = $1";

module.exports = {
  findUserBroker,
  findBroker,
  addBroker,
  updateBroker,
  deleteBroker,
};
