"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
}
exports.sequelize = new sequelize_1.Sequelize(dbUrl, {
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    ssl: process.env.NODE_ENV === "production",
    dialectOptions: process.env.NODE_ENV === "production"
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }
        : {},
});
