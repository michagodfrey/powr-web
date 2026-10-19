// TypeScript allows us to define interfaces - blueprints for object shapes
// This is similar to PropTypes in JavaScript, but with compile-time checking

// How an exercise's sets are measured:
// weighted = weight × reps (volume), reps = bodyweight reps only, timed = holds in seconds
export type ExerciseType = "weighted" | "reps" | "timed";

// Represents a single exercise set
// Which of weight/reps/durationSeconds are filled depends on the exercise type
export interface Set {
  id: number;
  weight: number | null;
  reps: number | null;
  durationSeconds?: number | null;
  // The '?' makes this property optional
  notes?: string;
  // Union type: can be either 'kg' or 'lb'
  unit: "kg" | "lb";
  // Optional set number for ordering
  setNumber?: number;
  // Optional volume field
  volume?: number;
}

// Represents a workout session
export interface WorkoutSession {
  id: number;
  userId: number;
  exerciseId: number;
  date: string;
  notes?: string;
  // Headline metric by exercise type: volume, total reps, or total seconds
  totalVolume: number;
  unit: "kg" | "lb";
  sets: Set[];
  createdAt?: string;
  updatedAt?: string;
}

// Represents an exercise
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  // Older API responses may omit this; treat missing as "weighted"
  exerciseType?: ExerciseType;
  // Generic type Array<WorkoutSession> is equivalent to WorkoutSession[]
  workoutHistory: Array<WorkoutSession>;
}

// Represents the user's preferences
export interface UserPreferences {
  // Union type with specific string literals
  preferredUnit: "kg" | "lb";
  // Boolean for theme preference
  darkMode: boolean;
}

// Example of a type alias - similar to interface but can be used for unions and primitives
export interface DateRangeState {
  startDate: Date;
  endDate: Date;
}

// Example of an enum - a way to define a set of named constants
export enum ChartType {
  Volume = "volume",
  MaxWeight = "maxWeight",
  TotalReps = "totalReps",
}
