const router = require("express").Router();
const { query } = require("../db/pg");
const {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../db/queries/transactionsSql");

const { getMarketPrices } = require("./utils/portFunctions");

// console.log("api/routes/transactions.js: ", req.body);

// add transaction
router.post("/", async (req, res) => {
  const {
    symbol,
    shares,
    tradeDate,
    purchasePrice,
    comment,
    portId,
    portName,
    brokerId,
    brokerName,
    userId,
  } = req.body;

  try {
    const transObj = await query(addTransaction, [
      symbol,
      shares,
      tradeDate,
      purchasePrice,
      comment,
      portId,
      brokerId,
      userId,
    ]);

    const buyTrans = transObj.rows;

    getMarketPrices([symbol]).then((quotes) => {
      const trans = buyTrans[0];
      const buyTransaction = {
        ...trans,
        portName,
        brokerName,
        shares: Number(trans.shares),
        purchasePrice: Number(trans.purchase_price),
        bookValue: trans.shares * trans.purchase_price,
        marketValue:
          trans.shares *
          (quotes[trans.symbol] ? quotes[trans.symbol].price : ""),
        prevDayMV:
          trans.shares *
          (quotes[trans.symbol]
            ? quotes[trans.symbol].marketPreviousClose
            : ""),
        uglDay:
          trans.shares *
          (quotes[trans.symbol] ? quotes[trans.symbol].marketChange : ""),

        gainLoss:
          trans.shares *
            (quotes[trans.symbol] ? quotes[trans.symbol].price : "") -
          trans.shares * trans.purchase_price,

        currentPrice: quotes[trans.symbol] ? quotes[trans.symbol].price : "",
        marketChange: quotes[trans.symbol]
          ? quotes[trans.symbol].marketChange
          : "",
        marketPreviousClose: quotes[trans.symbol]
          ? quotes[trans.symbol].marketPreviousClose
          : "",
        newTransaction: true,
      };

      res.status(200).json({
        status: "success",
        buyTransaction,
      });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// update transaction
router.put("/:id", async (req, res) => {
  const transId = req.params.id;
  const {
    symbol,
    shares,
    tradeDate,
    purchasePrice,
    comment,
    portId,
    portName,
    brokerId,
    brokerName,
  } = req.body;

  try {
    const qryResult = await query(updateTransaction, [
      transId,
      symbol,
      shares,
      tradeDate,
      purchasePrice,
      comment,
      portId,
      brokerId,
    ]);

    const buyTrans = qryResult.rows;

    getMarketPrices([symbol]).then((quotes) => {
      const buyTransaction = buyTrans.map((trans) => ({
        ...trans,
        portName,
        brokerName,
        bookValue: trans.shares * trans.purchase_price,
        marketValue:
          trans.shares *
          (quotes[trans.symbol] ? quotes[trans.symbol].price : ""),
        prevDayMV:
          trans.shares *
          (quotes[trans.symbol]
            ? quotes[trans.symbol].marketPreviousClose
            : ""),
        uglDay:
          trans.shares *
          (quotes[trans.symbol] ? quotes[trans.symbol].marketChange : ""),

        gainLoss:
          trans.shares *
            (quotes[trans.symbol] ? quotes[trans.symbol].price : "") -
          trans.shares * trans.purchase_price,

        currentPrice: quotes[trans.symbol] ? quotes[trans.symbol].price : "",
        marketChange: quotes[trans.symbol]
          ? quotes[trans.symbol].marketChange
          : "",
        marketPreviousClose: quotes[trans.symbol]
          ? quotes[trans.symbol].marketPreviousClose
          : "",
        newTransaction: false,
      }));

      res.status(200).json({
        status: "success",
        buyTransaction,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

// delete transaction
router.delete("/:id", async (req, res) => {
  const transId = req.params.id;

  try {
    await query(deleteTransaction, [transId]);

    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
