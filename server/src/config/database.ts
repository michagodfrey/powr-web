import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const isDev = process.env.NODE_ENV === "development";

const sequelize = new Sequelize(process.env.DATABASE_URL || "", {
  logging: isDev ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    // Use snake_case for database column names
    underscored: true,
    // Don't pluralize table names
    freezeTableName: true,
    // Use camelCase for model attributes
    timestamps: true,
  },
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Auto-sync enabled for development mode
    await sequelize.sync({ alter: isDev });
    console.log("Database connection ready.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default sequelize;
