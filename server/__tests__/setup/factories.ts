import { User } from "../../src/models/User";
import { Exercise } from "../../src/models/Exercise";
import { WorkoutSession } from "../../src/models/WorkoutSession";
import { Set } from "../../src/models/Set";

interface CreateUserOptions {
  name?: string;
  email?: string;
  googleId?: string;
  preferredUnit?: "kg" | "lb";
}

interface CreateExerciseOptions {
  name?: string;
  description?: string;
  userId: number;
  isArchived?: boolean;
}

interface CreateWorkoutOptions {
  userId?: number;
  exerciseId?: number;
  date?: Date;
  notes?: string;
  unit?: "kg" | "lb";
  sets?: Array<{
    weight: number;
    reps: number;
    notes?: string;
  }>;
}

export const createTestUser = async (options: CreateUserOptions = {}) => {
  const defaultUser = {
    name: "Test User",
    email: `test.${Date.now()}@example.com`,
    googleId: `google_${Date.now()}`,
    preferredUnit: "kg" as const,
    ...options,
  };

  return await User.create(defaultUser);
};

export const createTestExercise = async (
  options: Partial<CreateExerciseOptions> = {}
) => {
  let userId = options.userId;
  if (!userId) {
    const user = await createTestUser();
    userId = user.id;
  }

  const defaultExercise = {
    name: `Exercise ${Date.now()}`,
    description: "Test exercise description",
    userId,
    isArchived: false,
    ...options,
  };

  return await Exercise.create(defaultExercise);
};

export const createTestWorkout = async (options: CreateWorkoutOptions = {}) => {
  // Create user and exercise if not provided
  if (!options.userId) {
    const user = await createTestUser();
    options.userId = user.id;
  }

  if (!options.exerciseId) {
    const exercise = await createTestExercise({ userId: options.userId });
    options.exerciseId = exercise.id;
  }

  // Default sets if none provided
  const defaultSets = [
    { weight: 100, reps: 5, notes: "" },
    { weight: 100, reps: 5, notes: "" },
    { weight: 100, reps: 5, notes: "" },
  ];

  const sets = options.sets || defaultSets;
  const unit = options.unit || "kg";

  // Calculate total volume
  const totalVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);

  // Create workout session
  const workout = await WorkoutSession.create({
    userId: options.userId,
    exerciseId: options.exerciseId,
    date: options.date || new Date(),
    notes: options.notes,
    totalVolume,
    unit,
  });

  // Create sets
  await Promise.all(
    sets.map((set, index) =>
      Set.create({
        sessionId: workout.id,
        setNumber: index + 1,
        weight: set.weight,
        reps: set.reps,
        unit,
        volume: set.weight * set.reps,
        notes: set.notes || "",
      })
    )
  );

  return workout;
};
