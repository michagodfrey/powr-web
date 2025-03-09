"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Exercise_1 = __importDefault(require("./Exercise"));
const User_1 = __importDefault(require("./User"));
class WorkoutSession extends sequelize_1.Model {
    // Calculate total volume for the session
    calculateTotalVolume() {
        return this.sets.reduce((total, set) => {
            const weight = set.unit === "lb" ? set.weight * 0.453592 : set.weight; // Convert to kg if needed
            return total + weight * set.reps;
        }, 0);
    }
}
WorkoutSession.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
        references: {
            model: User_1.default,
            key: "id",
        },
    },
    exerciseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "exercise_id",
        references: {
            model: Exercise_1.default,
            key: "id",
        },
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    sets: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    totalVolume: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        field: "total_volume",
        defaultValue: 0,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: "workout_sessions",
    indexes: [
        {
            fields: ["user_id", "exercise_id", "date"],
            name: "workout_sessions_user_exercise_date_idx",
        },
    ],
    hooks: {
        beforeSave: (session) => __awaiter(void 0, void 0, void 0, function* () {
            session.totalVolume = session.calculateTotalVolume();
        }),
    },
});
// Define associations
WorkoutSession.belongsTo(User_1.default, { foreignKey: "user_id", as: "user" });
WorkoutSession.belongsTo(Exercise_1.default, {
    foreignKey: "exercise_id",
    as: "exercise",
});
User_1.default.hasMany(WorkoutSession, { foreignKey: "user_id", as: "workoutSessions" });
Exercise_1.default.hasMany(WorkoutSession, {
    foreignKey: "exercise_id",
    as: "workoutSessions",
});
exports.default = WorkoutSession;
