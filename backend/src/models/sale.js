import { DataTypes } from "sequelize";
import db from "../config/db.config.js";

const Sale = db.sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      indexes: [{ fields: ["date"] }],
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    storeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salespersonId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeeName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      indexes: [{ fields: ["customerName"] }],
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      indexes: [{ fields: ["phoneNumber"] }],
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerRegion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      indexes: [{ fields: ["quantity"] }],
    },
    pricePerUnit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "Sales",
    timestamps: true,
  }
);
export { Sale };
