const { default: axios } = require("axios")
const ClosingPrice = require("../models/closingPrice")
const moment = require("moment")
const syncClosingPricesHandler = require("../handlers/stocks")
const db = require('../config/db')

const API_KEY = "SHAV1DSZQFP9MPAG"
const API_URL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY"

const NO_OF_DAYS_TO_LOAD = 20

const fetchClosingPrices = (symbol) => {
    return new Promise(async (resolve, reject) => {
        let resp = await axios.get(API_URL + `&symbol=${symbol}&apikey=${API_KEY}`).catch(e => reject(e))
        let parsedData = await parseClosingPrices(resp.data).catch(e => reject(e))

        resolve(parsedData)
    })
}

const parseClosingPrices = (data) => {
    return new Promise(async (resolve, reject) => {
        let symbol = data["Meta Data"]["2. Symbol"]
        data = data["Time Series (Daily)"]
        let obj = []

        try {
            for (let date in data) {
                obj.push({ symbol: symbol, date: date, closingPrice: data[date]["4. close"] })
            }
            obj.sort((a, b) => {
                if (moment(a.date).isBefore(moment(b.date))) {
                    return -1
                } else {
                    return 1
                }
            })
            obj = obj.splice(obj.length - NO_OF_DAYS_TO_LOAD, NO_OF_DAYS_TO_LOAD)
            resolve(obj)
        } catch (e) {
            console.error("Failed to parse the stocks data")
            reject(e)
        }
    })
}

const saveClosingPrices = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            for (let closingPriceObj of data) {
                res = await ClosingPrice.findOne({
                    where: { symbol: closingPriceObj.symbol, date: closingPriceObj.date }
                }).catch(e => reject(e))
                if (res == undefined) {
                    // console.log(res)
                    await ClosingPrice.create(closingPriceObj).catch(e => reject(e))
                }
            }
            resolve()
        } catch (e) {
            console.error("Failed to save closingPrices to db")
            reject(e)
        }
    })
}

const getClosingPrices = (symbol) => {
    return new Promise(async (resolve, reject) => {
        try {
            let skipDBSync = false
            let today = moment()
            if (moment().hours() < 17) {
                today = moment(today).subtract(1, "days")
                skipDBSync = true
            }

            res = await ClosingPrice.findOne({
                where: { symbol: symbol, date: today.format("YYYY-MM-DD") }
            }).catch(e => reject(e))


            await db.authenticate().catch(e => console.error(e))

            let data = await ClosingPrice.findAll({ where:{symbol: symbol}, limit: NO_OF_DAYS_TO_LOAD, order: [['date', 'DESC']] })
            resolve(data)

        } catch (e) {
            reject(e)
        } finally {
            // db.close()
        }

    })
}

const getClosingPricesArr = (cp) => {
    try {
        let cpArr = []
        for (let i = 0; i < cp.length; i++) {
            cpArr[i] = parseFloat(cp[i].closingPrice)
        }
        return cpArr
    } catch (e) {
        console.error(e)
        return []
    }
}

module.exports = { fetchClosingPrices, saveClosingPrices, getClosingPrices, getClosingPricesArr }