import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import Exercise from "./Exercise";
import User from "./User";

interface WorkoutSetData {
  weight: number;
  reps: number;
  unit: "kg" | "lb";
}

interface WorkoutSessionAttributes {
  id: number;
  userId: number;
  exerciseId: number;
  date: Date;
  sets: WorkoutSetData[];
  totalVolume: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkoutSessionCreationAttributes
  extends Omit<WorkoutSessionAttributes, "id"> {}

class WorkoutSession
  extends Model<WorkoutSessionAttributes, WorkoutSessionCreationAttributes>
  implements WorkoutSessionAttributes
{
  public id!: number;
  public userId!: number;
  public exerciseId!: number;
  public date!: Date;
  public sets!: WorkoutSetData[];
  public totalVolume!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Calculate total volume for the session
  public calculateTotalVolume(): number {
    return this.sets.reduce((total, set) => {
      const weight = set.unit === "lb" ? set.weight * 0.453592 : set.weight; // Convert to kg if needed
      return total + weight * set.reps;
    }, 0);
  }
}

WorkoutSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    exerciseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Exercise,
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sets: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    totalVolume: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "workout_sessions",
    indexes: [
      {
        fields: ["userId", "exerciseId", "date"],
        name: "workout_sessions_user_exercise_date_idx",
      },
    ],
    hooks: {
      beforeSave: async (session: WorkoutSession) => {
        session.totalVolume = session.calculateTotalVolume();
      },
    },
  }
);

// Define associations
WorkoutSession.belongsTo(User, { foreignKey: "userId", as: "user" });
WorkoutSession.belongsTo(Exercise, {
  foreignKey: "exerciseId",
  as: "exercise",
});
User.hasMany(WorkoutSession, { foreignKey: "userId", as: "workoutSessions" });
Exercise.hasMany(WorkoutSession, {
  foreignKey: "exerciseId",
  as: "workoutSessions",
});

export default WorkoutSession;
