const findPortfolio =
  "SELECT * FROM portfolio WHERE port_name = $1 AND user_id = $2";
const buyTransactions = `SELECT
      p.port_id,
      p.port_name,
      p.currency,
      p.asset_class,
      t.trans_buy_id,
      t.symbol,
      t.trade_date,
      t.purchase_price,
      t.shares,
      t.shares * t.purchase_price as book_value,
      t.comment,
      t.fee,
      t.tax,
      t.commission,
      t.compliance_id,
      t.broker_id,
      b.broker_name,
      t.user_id
    FROM
      portfolio p
    LEFT JOIN
      transaction_buy t
    ON
      p.port_id = t.port_id
    LEFT JOIN
      broker b
    ON
      b.broker_id = t.broker_id
    WHERE
      p.user_id = $1
    ORDER BY
      p.port_id,
      t.symbol,
      t.trans_buy_id
`;
const addPortfolio =
  "INSERT INTO portfolio(port_name, user_id) VALUES($1, $2) RETURNING *";
const updatePortfolio =
  "UPDATE portfolio SET port_name = $1 WHERE port_id = $2 RETURNING *";

const deletePortfolio = "DELETE FROM portfolio WHERE port_id = $1";

module.exports = {
  findPortfolio,
  buyTransactions,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
};
