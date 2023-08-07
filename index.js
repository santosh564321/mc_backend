const serverless = require("serverless-http");
const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser')
const moment = require('moment')
const syncClosingPricesHandler = require("./handlers/stocks");
const { getClosingPrices } = require("./utils/stocks");
const runCalculation = require("./handlers/calculate");
const app = express();

var CronJob = require('cron').CronJob;

const db = require('./config/db')
const ClosingPrice = require("./models/closingPrice")

app.use(cors())
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/path", (req, res) => {
  res.status(200).json({
    message: "Hello from path!",
  });
});

app.get("/closingprices", async (req, res) => {
  let startDate = req.query.startDate ? moment(req.query.startDate).format('YYYY-MM-DD') : '2023-01-01'
  let endDate = req.query.endDate ? moment(req.query.endDate).format('YYYY-MM-DD') : '2024-01-01'
  let symbol = req.query.symbol ? req.query.symbol : 'ADSK'
  resData = await getClosingPrices(symbol, startDate, endDate)
  res.status(200).json(resData)
})

app.post("/calculate", (req, res) => {
  console.log("request data", req.body)
  runCalculation("ADSK", req.body).then((resp) => {
    res.status(200).json(resp)
  })
    .catch((err) => {
      console.log(err)
      res.status(500).json({ error: err })
    })
})

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
  });
});

app.listen(3030, async () => {
  console.log("server running on port 3030")
  await db.authenticate().catch(e => console.error(e))
  console.info("connected to DB")
  ClosingPrice.sync({
    alter: true
  })

  // let job = new CronJob(
  //   '30 5 * * ? *',
  //   () => {
  //     syncClosingPricesHandler(null, null, () => { console.info("synced today's closing price") })
  //   },
  //   null,
  //   true,
  //   'America/New_York'
  // )
  // job.start()
})


// module.exports.apiHandler = serverless(app);
// module.exports.syncClosingPricesHandler = syncClosingPricesHandler
