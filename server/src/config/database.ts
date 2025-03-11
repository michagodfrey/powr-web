import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { Workout } from "../models/Workout";
import { Exercise } from "../models/Exercise";
import { WorkoutExercise } from "../models/WorkoutExercise";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isDev = process.env.NODE_ENV === "development";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: isDev ? console.log : false,
  ssl: process.env.NODE_ENV === "production",
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
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
    // Add timestamps by default
    timestamps: true,
    // Use snake_case for timestamps
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    Workout.associateModels();
    Exercise.associateModels();
    WorkoutExercise.associateModels();

    // Sync database in development
    if (isDev) {
      await sequelize.sync({ alter: true });
      console.log("Database synchronized");
    }

    return sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default sequelize;
