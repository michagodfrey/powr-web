import { Sequelize } from "sequelize";
import { Exercise } from "./Exercise";
import { User } from "./User";
import { Set } from "./Set";
import { WorkoutSession } from "./WorkoutSession";
import { Session } from "./Session";

export const initializeModels = (sequelize: Sequelize) => {
  // Initialize all models
  Exercise.initModel(sequelize);
  User.initModel(sequelize);
  Set.initModel(sequelize);
  WorkoutSession.initModel(sequelize);
  Session.initModel(sequelize);

  // Define associations
  User.hasMany(Exercise, {
    foreignKey: "userId",
    as: "exercises",
  });
  Exercise.belongsTo(User, {
    foreignKey: "userId",
  });

  User.hasMany(WorkoutSession, {
    foreignKey: "userId",
    as: "workoutSessions",
  });
  WorkoutSession.belongsTo(User, {
    foreignKey: "userId",
  });

  Exercise.hasMany(WorkoutSession, {
    foreignKey: "exerciseId",
    as: "workoutSessions",
  });
  WorkoutSession.belongsTo(Exercise, {
    foreignKey: "exerciseId",
    as: "exercise",
  });

  WorkoutSession.hasMany(Set, {
    foreignKey: "sessionId",
    as: "sets",
  });
  Set.belongsTo(WorkoutSession, {
    foreignKey: "sessionId",
  });

  // Initialize Session associations
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
