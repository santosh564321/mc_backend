// calculate logarithmic rate of return
const calculateLRR = (cpArr) => {
    try {
        let lrr = []
        for (let i = 1; i < cpArr.length; i++) {
            lrr.push(Math.log(cpArr[i] / cpArr[i - 1]))
        }
        return lrr
    } catch (e) {
        console.error("error calculating LRR", e)
        return []
    }
}

// calculate variance of return
const calculateVOR = (lrr) => {
    try {
        let vor = []
        for (let i = 0; i < lrr.length; i++) {
            vor.push(Math.pow(lrr[i], 2))
        }
        return vor
    } catch (e) {
        console.error("error calculating VOR", e)
        return []
    }
}

// calculate cumulative distribution function ("NORMSINV" in excel)
const calculateNormSInv = (p) => {
    try {
        let a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969
        let a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924
        let b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887
        let b4 = 66.8013118877197, b5 = -13.2806815528857, c1 = -7.78489400243029E-03
        let c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373
        let c5 = 4.37466414146497, c6 = 2.93816398269878, d1 = 7.78469570904146E-03
        let d2 = 0.32246712907004, d3 = 2.445134137143, d4 = 3.75440866190742
        let p_low = 0.02425, p_high = 1 - p_low
        let q, r
        let retVal

        if ((p < 0) || (p > 1)) {
            console.error("NormSInv: Argument out of range")
            retVal = 0
        }
        else if (p < p_low) {
            q = Math.sqrt(-2 * Math.log(p))
            retVal = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
        }
        else if (p <= p_high) {
            q = p - 0.5
            r = q * q
            retVal = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
        }
        else {
            q = Math.sqrt(-2 * Math.log(1 - p))
            retVal = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
        }
        return retVal
    } catch (e) {
        console.error("error calculating NormSInv", e)
        return 0
    }
}

// calculate mean of an array
const calculateMean = (arr) => {
    try {
        let sum = 0
        for (el of arr) {
            sum += el
        }
        return sum / arr.length
    } catch (error) {
        console.error("error calculating mean of an array", e)
        return 0
    }
}

// calculate monte carlo
const calculateMC = (cpArr, lrr, vor, noOfDays) => {
    try {
        const meanLogReturn = calculateMean(lrr)
        // console.log("==========Mean log return========\n", meanLogReturn)
        const dailyVariance = calculateMean(vor)
        // console.log("==========Daily variance ========\n", dailyVariance)
        const annualizedVariance = dailyVariance * 252
        const annualizedSD = Math.sqrt(annualizedVariance)

        let mc = []
        mc.push(cpArr[0])

        for (let i = 1; i < noOfDays; i++) { // here i corresponds to the index of current mc value
            let mcVal = mc[i - 1] * (1 + meanLogReturn * (1 / noOfDays) + annualizedVariance * Math.sqrt(1 / noOfDays) * calculateNormSInv(Math.random()))
            mc.push(mcVal)
        }
        return mc
    } catch (error) {
        console.error("error calculating monte carlo", e)
        return []
    }
}

const calculateRollingAvgTable = (cpArr, mcTable, rows, cols) => {
    try {
        let sma = []
        cpArr.reverse()
        cpArr.splice(cpArr.length - 1, 1)
        for (let i = 0; i < rows - 1; i++) {
            let sma_row = []
            let smaConcat = cpArr.concat(mcTable[i + 1])
            for (let j = 0; j < cols; j++) {

                let sum = 0
                for (let k = j; k < 20 + j; k++) {
                    sum += smaConcat[k]
                }
                sma_row.push(sum / 20)
            }
            sma.push(sma_row)
        }
        return sma
    } catch (error) {
        console.error("error calculating rolling average", error)
        return [[]]
    }
}

// calculate scenario spend values
const calculateSnSpend = (sma, mcTable, reqBody, rows, cols) => {
    const costAvgLimitPricePerShare = reqBody.costAvgLimitPricePerShare ? reqBody.costAvgLimitPricePerShare : 0
    const dailyCostAvg = reqBody.dailyCostAvg ? reqBody.dailyCostAvg : 0
    const dailyMinSpend = reqBody.dailyMinSpend ? reqBody.dailyMinSpend : 0
    const limitPrice1 = reqBody.limitPrice1 ? reqBody.limitPrice1 : 0, limitPrice2 = reqBody.limitPrice2 ? reqBody.limitPrice2 : 0, limitPrice3 = reqBody.limitPrice3 ? reqBody.limitPrice3 : 0, limitPrice4 = reqBody.limitPrice4 ? reqBody.limitPrice4 : 0, limitPrice5 = reqBody.limitPrice5 ? reqBody.limitPrice5 : 0
    const dailySpend1 = reqBody.dailySpend1 ? reqBody.dailySpend1 : 0, dailySpend2 = reqBody.dailySpend2 ? reqBody.dailySpend2 : 0, dailySpend3 = reqBody.dailySpend3 ? reqBody.dailySpend3 : 0, dailySpend4 = reqBody.dailySpend4 ? reqBody.dailySpend4 : 0, dailySpend5 = reqBody.dailySpend5 ? reqBody.dailySpend5 : 0
    const percentile1 = 1, percentile2 = 0.98, percentile3 = 0.96
    const dailySpendSMA1 = reqBody.dailySpendPar ? reqBody.dailySpendPar : 0, dailySpendSMA2 = reqBody.dailySpendPercent2Below ? reqBody.dailySpendPercent2Below : 0, dailySpendSMA3 = reqBody.dailySpendPercent4Below ? reqBody.dailySpendPercent4Below : 0

    let scenarioSpend = []
    for (let i = 0; i < rows - 1; i++) {
        let scenarioSpendRow = []
        for (let j = 0; j < rows - 1; j++) {
            let result = 0
            let mcVal = mcTable[i + 1][j + 1]
            let smaVal = sma[i][j]
            if (mcVal < costAvgLimitPricePerShare) {
                result += dailyCostAvg
            }

            result += (mcVal < limitPrice1 ? dailySpend1 : 0)
            result += (mcVal < limitPrice2 ? dailySpend2 - dailySpend1 : 0)
            result += (mcVal < limitPrice3 ? dailySpend3 - dailySpend2 : 0)
            result += (mcVal < limitPrice4 ? dailySpend4 - dailySpend3 : 0)
            result += (mcVal < limitPrice5 ? dailySpend5 - dailySpend4 : 0)


            if (mcVal < 500) {
                result += (mcVal < (smaVal * percentile1)) ? dailySpendSMA1 : 0
                result += (mcVal < (smaVal * percentile2)) ? dailySpendSMA2 - dailySpendSMA1 : 0
                result += (mcVal < (smaVal * percentile3)) ? dailySpendSMA3 - dailySpendSMA2 : 0
            }
            result = (result === 0) ? dailyMinSpend : result
            scenarioSpendRow.push(result)
        }
        scenarioSpend.push(scenarioSpendRow)
    }
    return scenarioSpend
}

const calculate2QTotal = (snSpend, rows) => {
    let result = []
    for (let i = 0; i < rows - 1; i++) {
        let sum = 0
        for (let j = 0; j < 7; j++) {
            sum += snSpend[i][j]
        }
        result.push(sum)
    }
    return result
}

const calculateSharesPurchased = (mcTable, snSpend) => {
    let sharesPurchased = []
    for (let i = 0; i < snSpend.length; i++) {
        let row = []
        for (let j = 0; j < snSpend[i].length; j++) {
            row.push(Math.round(snSpend[i][j] / mcTable[i + 1][j]))
        }
        sharesPurchased.push(row)
    }
    return sharesPurchased
}

const calculateStats = (q2Total) => {
    let max, min, mean, median
    min = Math.min(...q2Total)
    max = Math.max(...q2Total)
    let sum = q2Total.reduce((a, b) => a + b, 0)
    mean = sum / q2Total.length

    q2Total.sort((a, b) => a - b)
    if (q2Total.length % 2 === 0) {
        median = (q2Total[q2Total.length / 2 - 1] + q2Total[q2Total.length / 2]) / 2
    } else {
        median = q2Total[(q2Total.length - 1) / 2]
    }

    let squaredDiffs = q2Total.map(value => Math.pow(value - mean, 2))
    let avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    let stdDev = Math.sqrt(avgSquaredDiff)

    let stdPlus1 = mean + stdDev
    let stdMinus1 = mean - stdDev

    mean = Math.round(mean * 100) / 100
    stdDev = Math.round(stdDev * 100) / 100
    stdPlus1 = Math.round(stdPlus1 * 100) / 100
    stdMinus1 = Math.round(stdMinus1 * 100) / 100

    return { min, max, mean, median, stdDev, stdPlus1, stdMinus1 }
}

const roundOff1DArray = (arr) => {
    return arr.map(number => Math.round(number * 100) / 100)
}

const roundOff2DArray = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].map(number => Math.round(number * 100) / 100)
    }
    return arr
}


module.exports = { calculateLRR, calculateVOR, calculateMC, calculateRollingAvgTable, calculateSnSpend, calculateSharesPurchased, calculate2QTotal, calculateStats, roundOff2DArray, roundOff1DArray, calculateMean }