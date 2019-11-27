const router = require("express").Router();
const Transaction = require("../models/transaction.js");

try {
  router.post("/api/transaction", async ({ body }, res) => {
    console.log( `[POST transaction]`, body );
    const dbTransaction = await Transaction.create(body);
    res.json(dbTransaction);
  });

  router.post("/api/transaction/bulk", async ({ body }, res) => {
    console.log( `[POST transaction/bulk]`, body );
    // mongo uses _id as it's unique-key, it DROPS/IGNORES the 'id' sent to it
    // so we have to gather those id elements 
    const dbTransaction = await Transaction.insertMany(body);

    let offlineIds = [];
    for( let tx of dbTransaction )
    offlineIds.push( tx.offlineId );

    console.log( ` sending back offlineIds: `, offlineIds );

    // push back the list of offlineId's that we have sync'd.
    res.send({offlineIds: offlineIds});
  });

  router.get("/api/transaction", async (req, res) => {
    const dbTransaction = await Transaction.find({}).sort({ date: -1 });
    console.log( `[GET transaction] listing all transactions`, dbTransaction );
    res.json(dbTransaction);
  });

} catch( err ){
  res.status(400).json(err);
}
module.exports = router;
