const { fetchClosingPrices, saveClosingPrices } = require("../utils/stocks")
const db = require('../config/db')
const ClosingPrice = require("../models/closingPrice")

const DEFAULT_SYMBOL = "ADSK"

const syncClosingPricesHandler = async (event, context, callback) => {
    try {
        console.info("syncClosingPricesHandler called")
        await db.authenticate().catch(e => console.error(e))
        console.info("connected to DB")
        ClosingPrice.sync({
            alter: true
        })
        
        let closingPriceData = await fetchClosingPrices(DEFAULT_SYMBOL).catch(e => console.error(e))
        await saveClosingPrices(closingPriceData).catch(e => console.error(e))
        console.info("saved closing price data")
    } catch (e) {
        console.error(e)
    } finally {
        if(callback){
            callback()
        }
    }
}

module.exports = syncClosingPricesHandler