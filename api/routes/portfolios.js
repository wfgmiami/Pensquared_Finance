const router = require("express").Router();
const { query } = require("../db/pg");
const {
  buyTransactions,
  findPortfolio,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require("../db/queries/portfoliosSql");
const {
  getMarketPrices,
  portfoliosSummary,
  portfoliosHoldings,
} = require("./utils/portFunctions");

// console.log("api/routes/portfolios.js: ", req.body);

// api/portfolios/:id
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const buyTransObj = await query(buyTransactions, [userId]);
    const buyTrans = buyTransObj.rows;
    if (buyTrans.length > 0) {
      const portSymbols = [...new Set(buyTrans.map((trans) => trans.symbol))];

      getMarketPrices(portSymbols).then((quotes) => {
        const portTransactions = buyTrans.map((trans) => ({
          ...trans,
          shares: Number(trans.shares),
          purchase_price: Number(trans.purchase_price),
          book_value: Number(trans.book_value),
          market_value:
            trans.shares *
            (quotes[trans.symbol] ? quotes[trans.symbol].price : ""),
          prev_day_mv:
            trans.shares *
            (quotes[trans.symbol]
              ? quotes[trans.symbol].marketPreviousClose
              : ""),
          ugl_day:
            trans.shares *
            (quotes[trans.symbol] ? quotes[trans.symbol].marketChange : ""),

          gain_loss:
            trans.shares *
              (quotes[trans.symbol] ? quotes[trans.symbol].price : "") -
            trans.shares * trans.purchase_price,

          current_price: quotes[trans.symbol] ? quotes[trans.symbol].price : "",
          marketChange: quotes[trans.symbol]
            ? quotes[trans.symbol].marketChange
            : "",
          marketPreviousClose: quotes[trans.symbol]
            ? quotes[trans.symbol].marketPreviousClose
            : "",
        }));

        const buyTransactions = portTransactions.filter(
          (trans) => trans.symbol
        );
        const portfolios = portfoliosSummary(portTransactions, userId);
        const holdings = portfoliosHoldings(buyTransactions);
        res.status(200).json({
          portfolios,
          holdings,
          buyTransactions,
        });
      });
    } else {
      res.status(200).json({
        portfolios: [],
        holdings: [],
        buyTransactions: [],
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// add portfolio
router.post("/", async (req, res) => {
  const { portName, userId } = req.body;

  try {
    const portfolioObj = await query(findPortfolio, [portName, userId]);

    if (portfolioObj.rows.length > 0) {
      res.status(400).json("Portfolio name already exists!");
    } else {
      const newPortfolio = await query(addPortfolio, [portName, userId]);

      res.status(201).json({
        portfolio: newPortfolio.rows[0],
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// update portfolio
router.put("/:id", async (req, res) => {
  const portId = req.params.id;
  const { portName, userId } = req.body;

  try {
    const portfolioObj = await query(findPortfolio, [portName, userId]);

    if (portfolioObj.rows.length > 0) {
      res.status(400).json("Portfolio name already exists!");
    } else {
      const updatedPortfolio = await query(updatePortfolio, [portName, portId]);

      res.status(200).json({
        portfolio: updatedPortfolio.rows[0],
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete portfolio
router.delete("/:id", async (req, res) => {
  const portId = req.params.id;

  try {
    await query(deletePortfolio, [portId]);

    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
