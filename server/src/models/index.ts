// Database model initialization and association configuration
// Sets up relationships between models and exports them for use throughout the application
import { Sequelize } from "sequelize";
import { Exercise } from "./Exercise";
import { User } from "./User";
import { Set } from "./Set";
import { WorkoutSession } from "./WorkoutSession";
import { Session } from "./Session";

export const initializeModels = (sequelize: Sequelize) => {
  // Initialize all models with their database schemas
  Exercise.initModel(sequelize);
  User.initModel(sequelize);
  Set.initModel(sequelize);
  WorkoutSession.initModel(sequelize);
  Session.initModel(sequelize);

  // Define model relationships and foreign key constraints

  // User -> Exercise relationship (one-to-many)
  User.hasMany(Exercise, {
    foreignKey: "userId",
    as: "exercises",
  });
  Exercise.belongsTo(User, {
    foreignKey: "userId",
  });

  // User -> WorkoutSession relationship (one-to-many)
  User.hasMany(WorkoutSession, {
    foreignKey: "userId",
    as: "workoutSessions",
  });
  WorkoutSession.belongsTo(User, {
    foreignKey: "userId",
  });

  // Exercise -> WorkoutSession relationship (one-to-many)
  Exercise.hasMany(WorkoutSession, {
    foreignKey: "exerciseId",
    as: "workoutSessions",
  });
  WorkoutSession.belongsTo(Exercise, {
    foreignKey: "exerciseId",
    as: "exercise",
  });

  // WorkoutSession -> Set relationship (one-to-many)
  WorkoutSession.hasMany(Set, {
    foreignKey: "sessionId",
    as: "sets",
  });
  Set.belongsTo(WorkoutSession, {
    foreignKey: "sessionId",
  });

  // Initialize session table associations
  Session.associateModels();

  return {
    Exercise,
    User,
    Set,
    WorkoutSession,
    Session,
  };
};

export { Exercise, User, Set, WorkoutSession, Session };
