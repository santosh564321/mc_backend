const { calculateLRR, calculateVOR, calculateMC, calculateRollingAvgTable, calculateSnSpend, calculate2QTotal, calculateStats, roundOff2DArray, calculateSharesPurchased, calculateMean } = require("../utils/mc")
const { getClosingPrices, getClosingPricesArr } = require("../utils/stocks")
const moment = require('moment')

const runCalculation = (symbol, reqBody) => {
    return new Promise(async (resolve, reject) => {
        try {
            let startDate = reqBody.startDate != '' ? moment(reqBody.endDate).format('YYYY-MM-DD') : moment().subtract(10, 'days').format('YYYY-MM-DD')
            let endDate = reqBody.endDate != '' ? moment(reqBody.endDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD') 
            let MC_ROWS = reqBody.noOfIterations ? reqBody.noOfIterations : 200
            let NO_DAYS = reqBody.noOfDaysInAnalysis ? reqBody.noOfDaysInAnalysis : 200

            let closingPrices = await getClosingPrices(symbol, startDate, endDate).catch(e => reject(e))
            console.log("======== closingPrices ===============", closingPrices)
            let closingPricesArr = getClosingPricesArr(closingPrices)
            console.log("==========cpArr========\n", closingPricesArr)
            let lrr = calculateLRR(closingPricesArr)
            console.log("==========LRR========\n", lrr)
            let vor = calculateVOR(lrr)
            console.log("==========VOR========\n", vor)
            let dailyVariance = calculateMean(vor)
            let annulazedVariance = dailyVariance * 252
            let annulazedSD = Math.sqrt(annulazedVariance)

            let mcTable = []
            for (let i = 0; i < MC_ROWS; i++) {
                mcTable.push(
                    calculateMC(closingPricesArr, lrr, vor, NO_DAYS)
                )
            }
            console.log("==========MC TABLE========\n", mcTable)

            // Calculate sma
            let sma = calculateRollingAvgTable(closingPricesArr, mcTable, MC_ROWS, NO_DAYS)
            // console.log("==========SMA TABLE========\n", sma)

            // evaluate scenario spend
            let snSpend = calculateSnSpend(sma, mcTable, reqBody, MC_ROWS, NO_DAYS)
            // console.log("==========scenario spend========\n", snSpend)

            let q2Total = calculate2QTotal(snSpend, MC_ROWS)
            // console.log("==========2Q Tota===l=====\n", q2Total)

            let stats = calculateStats(q2Total)

            console.log("==========Min Max Mean Median========\n", stats.min, stats.max, stats.mean, stats.median, stats.stdDev, stats.stdPlus1, stats.stdMinus1)

            let sharesPurchased = calculateSharesPurchased(mcTable, snSpend)
            console.log(sharesPurchased.length, sharesPurchased[0].length)

            let q2TotalShares = calculate2QTotal(sharesPurchased)

            let sharesStats = calculateStats(q2TotalShares)

            let resultObj = {
                closingPrices,
                mcTable: roundOff2DArray(mcTable),
                sma: roundOff2DArray(sma),
                snSpend,
                sharesPurchased,
                stats,
                sharesStats,
                startDate,
                endDate,
                dailyVariance,
                annulazedVariance,
                annulazedSD
            }
            resolve(resultObj)

        } catch (error) {
            console.error(error)
            reject(error)
        }

    })
}

module.exports = runCalculation