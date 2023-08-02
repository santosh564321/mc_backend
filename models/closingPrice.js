const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const ClosingPrice = sequelize.define("closingprice", {
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  closingPrice: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  }
},{
  indexes:[
    {
      unique: true,
      fields: ['symbol', 'date']
    }
  ]
})

module.exports = ClosingPrice