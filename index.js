const serverless = require("serverless-http");
const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser')
const syncClosingPricesHandler = require("./handlers/stocks");
const { getClosingPrices } = require("./utils/stocks");
const runCalculation = require("./handlers/calculate");
const app = express();

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

app.get("/closingprices", async (req,res)=>{
  resData = await getClosingPrices("IBM")
  res.status(200).json(resData)
})

app.post("/calculate", (req, res)=>{
  console.log("request data", req.body)
  runCalculation("ADSK", req.body).then((resp)=>{
    res.status(200).json(resp)
  })
  .catch((err)=>{
    console.log(err)
    res.status(500).json({error: err})
  })
})

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
  });
});

app.listen(8080, ()=>{
  console.log("server running on port 3000")
})

// module.exports.apiHandler = serverless(app);
// module.exports.syncClosingPricesHandler = syncClosingPricesHandler
