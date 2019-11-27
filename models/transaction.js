const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: "Enter a name for transaction"
  },
  value: {
    type: Number,
    required: "Enter an amount"
  },
  date: {
    type: Date,
    default: Date.now
  },
  /* added in case we had offline-ids from indexDB, this verifies link to 
  transaction for deleting on client side, useless on server after initial sync */
  offlineId: {
    type: Number,
    default: 0
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
