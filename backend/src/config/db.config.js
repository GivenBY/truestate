import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "postgres",
  PASSWORD: process.env.DB_PASSWORD || "password",
  DB: process.env.DB_NAME || "truestate_sales_db",
  PORT: process.env.DB_PORT || "5432",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
};

// Use connection URI format for better DNS handling
const connectionString = `postgresql://${dbConfig.USER}:${dbConfig.PASSWORD}@${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`;

const sequelize = new Sequelize(connectionString, {
  dialect: dbConfig.dialect,
  pool: dbConfig.pool,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};
const db = {};
db.sequelize = sequelize;
db.connectDB = connectDB;

export default db;
