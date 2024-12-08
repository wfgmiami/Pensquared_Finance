const router = require("express").Router();
const { query } = require("../db/pg");
const {
  findUserBroker,
  findBroker,
  addBroker,
  updateBroker,
  deleteBroker,
} = require("../db/queries/brokersSql");

//  console.log("************", brokerObj);

// api/brokers/1 get userId=1 brokers
router.get("/:userId", async (req, res) => {
  try {
    const brokersObj = await query(findUserBroker, [req.params.userId]);
    // const users = usersObj.rows[0];
    res.status(200).json(brokersObj);
  } catch (err) {
    res.status(500).json(err);
  }
});

// api/broker add a broker
router.post("/", async (req, res) => {
  const { brokerName, userId } = req.body;

  try {
    const brokerObj = await query(findBroker, [brokerName, userId]);

    if (brokerObj.rows.length > 0) {
      res.status(400).json("Broker name already exists!");
    } else {
      const newBroker = await query(addBroker, [brokerName, userId]);
      res.status(200).json({
        broker: newBroker.rows[0],
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// update user's brokers
router.put("/:id", async (req, res) => {
  const brokerId = req.params.id;
  const { brokerName, userId } = req.body;

  try {
    const brokerObj = await query(findBroker, [brokerName, userId]);

    if (brokerObj.rows.length > 0) {
      res.status(400).json("Broker name already exists!");
    } else {
      const updatedBroker = await query(updateBroker, [brokerName, brokerId]);
      res.status(200).json({
        broker: updatedBroker.rows[0],
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete user's brokers
router.delete("/:id", async (req, res) => {
  const brokerId = req.params.id;

  try {
    await query(deleteBroker, [brokerId]);

    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
