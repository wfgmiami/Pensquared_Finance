const https = require("https");

const getMarketPrices = (symbols) => {
  const yahooFinance =
    "https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&fields=symbol,regularMarketPrice,regularMarketChange,regularMarketChangePercent,&symbols=";

  return new Promise((resolve, reject) => {
    https.get(yahooFinance + symbols, (response) => {
      let chunks = [];
      let quotes = {};
      response
        .on("data", (data) => {
          chunks.push(data);
        })
        .on("end", () => {
          const data = Buffer.concat(chunks);
          const result = JSON.parse(data);
          // console.log("getMarketPrices: result: ", result);
          const objArr = result.quoteResponse.result;

          quotes = objArr.reduce((finalObj, obj) => {
            const symbol = obj.symbol;
            const price = obj.regularMarketPrice;
            const marketChange = obj.regularMarketChange;
            const marketPreviousClose = obj.regularMarketPreviousClose;
            return {
              ...finalObj,
              [symbol]: { price, marketChange, marketPreviousClose },
            };
          }, {});

          for (let ticker in symbols) {
            const symbol = symbols[ticker];
            if (!(symbol in quotes)) quotes[symbol] = null;
          }
          resolve(quotes);
        })
        .on("error", (err) => {
          console.log("Error: " + err.message);
          reject(err);
        });
    });
  });
};

// getPortfolios = [{port_id: 1, port_name: "Potential", ...symbols: 5, user_id: 2, bv: 10242, mv: 22221, ....ugl_percent: 34}, {port_id: 2, port_name: "test", ..}]
const portfoliosSummary = (buyTransactions, user_id) => {
  const portIds = [...new Set(buyTransactions.map((trans) => trans.port_id))];
  // console.log("buyTrans: ", buyTransactions, "portIds: ", portIds);
  return portIds.map((port_id) => {
    const portSymbols = [
      ...new Set(
        buyTransactions
          .filter((trans) => trans.port_id === port_id)
          .map((portTrans) => portTrans.symbol)
      ),
    ];

    const symbols = portSymbols.filter((symbol) => symbol).length;

    return buyTransactions.reduce(
      (port, trans) => {
        if (port_id === trans.port_id) {
          port["port_name"] = trans.port_name;
          port["currency"] = trans.currency;
          port["asset_class"] = trans.asset_class;
          port["bv"] += trans.book_value;
          port["mv"] += trans.market_value;
          port["ugl"] += trans.gain_loss;

          port["ugl_day"] += trans.ugl_day;
          port["prev_day_mv"] += trans.prev_day_mv;

          isNaN(port["ugl_day"] / port["prev_day_mv"])
            ? (port["ugl_day_percent"] = 0)
            : (port["ugl_day_percent"] =
                (port["ugl_day"] / port["prev_day_mv"]) * 100);

          isNaN(port["ugl"] / port["bv"])
            ? (port["ugl_percent"] = 0)
            : (port["ugl_percent"] = (port["ugl"] / port["bv"]) * 100);

          port["symbols"] = symbols;
        }
        return port;
      },
      {
        port_id: parseInt(port_id),
        port_name: "",
        currency: "",
        asset_class: "",
        symbols: 0,
        user_id,
        bv: 0,
        mv: 0,
        prev_day_mv: 0,
        ugl_day: 0, // todays close - previous close price
        ugl_day_percent: 0, // ugl_day/previous close price
        ugl: 0,
        ugl_percent: 0,
      }
    );
  });
};

const portfoliosHoldings = (buyTransactions, user_id) => {
  const portIds = [...new Set(buyTransactions.map((trans) => trans.port_id))];

  const portTransactions = portIds.map((portId) => {
    return {
      [`${portId}`]: [
        ...buyTransactions.filter((trans) => trans.port_id === portId),
      ],
    };
  });
  // portTransactions = { '185':[{port_id: 185, symbol: 'AMZN', shares: 3, ...}, {port_id: 185,...}],
  // '158':[{},{}] }

  return portTransactions.map((portTrans) => {
    return {
      [`${Object.keys(portTrans)[0]}`]: Object.keys(portTrans).map((port) => {
        return [...new Set(portTrans[port].map((trans) => trans.symbol))].map(
          (symbol) => {
            return portTrans[port].reduce(
              (hold, trans) => {
                if (symbol === trans.symbol) {
                  hold["shares"] += trans.shares;
                  hold["current_price"] = trans.current_price;
                  hold["book_value"] += trans.book_value;

                  isNaN(hold["book_value"] / hold["shares"])
                    ? (hold["avg_cost_per_share"] = 0)
                    : (hold["avg_cost_per_share"] =
                        hold["book_value"] / hold["shares"]);
                  hold["market_value"] += trans.market_value;
                  hold["ugl"] += trans.gain_loss;
                  hold["port_id"] = trans.port_id;
                  hold["port_name"] = trans.port_name;
                }
                return hold;
              },
              {
                symbol,
                current_price: 0,
                shares: 0,
                avg_cost_per_share: 0,
                market_value: 0,
                book_value: 0,
                ugl: 0,
                port_id: null,
                port_name: "",
              }
            );
          }
        );
      })[0],
    };
  });
};

module.exports = {
  getMarketPrices,
  portfoliosSummary,
  portfoliosHoldings,
};
