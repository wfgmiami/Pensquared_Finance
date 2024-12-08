module.exports = {
  updateTransaction: `UPDATE
      transaction_buy
    SET
      symbol=$2,
      shares=$3,
      trade_date=$4,
      purchase_price=$5,
      comment=$6,
      port_id=$7,
      broker_id=$8
    WHERE
      trans_buy_id=$1
    RETURNING *
      `,
  addTransaction: `
      INSERT INTO transaction_buy
      (symbol, shares, trade_date, purchase_price, comment, port_id, broker_id, user_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
  deleteTransaction: `
    DELETE FROM transaction_buy WHERE trans_buy_id=$1
  `,
};
