const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const authRoute = require("./routes/auth");
const brokersRoute = require("./routes/brokers");
const portfoliosRoute = require("./routes/portfolios");
const transactionsRoute = require("./routes/transactions");

dotenv.config({ path: path.resolve(__dirname, "./.env") });
const PORT = process.env.PORT;

const app = express();

// middleware
app.use(express.json());

// helmet can set up HTTP headers
app.use(helmet());
// morgan logs HTTP requests and errors
app.use(morgan("common"));

// routes
app.use("/api/auth", authRoute);
app.use("/api/brokers", brokersRoute);
app.use("/api/portfolios", portfoliosRoute);
app.use("/api/transactions", transactionsRoute);

app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
