import { Sequelize } from "sequelize";
import { Exercise } from "./Exercise";
import { User } from "./User";
import { Set } from "./Set";
import { Workout } from "./Workout";
import { WorkoutExercise } from "./WorkoutExercise";
import { WorkoutSession } from "./WorkoutSession";
import { Session } from "./Session";

export const initializeModels = (sequelize: Sequelize) => {
  // Initialize all models
  Exercise.initModel(sequelize);
  User.initModel(sequelize);
  Set.initModel(sequelize);
  Workout.initModel(sequelize);
  WorkoutExercise.initModel(sequelize);
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

  User.hasMany(Workout, {
    foreignKey: "userId",
    as: "workouts",
  });
  Workout.belongsTo(User, {
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
  });

  Workout.belongsToMany(Exercise, {
    through: WorkoutExercise,
    foreignKey: "workoutId",
    as: "exercises",
  });
  Exercise.belongsToMany(Workout, {
    through: WorkoutExercise,
    foreignKey: "exerciseId",
    as: "workouts",
  });

  WorkoutExercise.hasMany(Set, {
    foreignKey: "workoutExerciseId",
    as: "sets",
  });
  Set.belongsTo(WorkoutExercise, {
    foreignKey: "workoutExerciseId",
  });

  // Initialize Session associations
  Session.associateModels();

  return {
    Exercise,
    User,
    Set,
    Workout,
    WorkoutExercise,
    WorkoutSession,
    Session,
  };
};

export {
  Exercise,
  User,
  Set,
  Workout,
  WorkoutExercise,
  WorkoutSession,
  Session,
};
