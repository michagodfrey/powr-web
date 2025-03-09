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
  exercise?: Exercise;
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
  public exercise?: Exercise;

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
      field: "user_id",
      references: {
        model: User,
        key: "id",
      },
    },
    exerciseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "exercise_id",
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
      field: "total_volume",
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "workout_sessions",
    indexes: [
      {
        fields: ["user_id", "exercise_id", "date"],
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
WorkoutSession.belongsTo(User, { foreignKey: "user_id", as: "user" });
WorkoutSession.belongsTo(Exercise, {
  foreignKey: "exercise_id",
  as: "exercise",
});
User.hasMany(WorkoutSession, { foreignKey: "user_id", as: "workoutSessions" });
Exercise.hasMany(WorkoutSession, {
  foreignKey: "exercise_id",
  as: "workoutSessions",
});

export default WorkoutSession;
