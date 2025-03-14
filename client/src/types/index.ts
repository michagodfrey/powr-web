// TypeScript allows us to define interfaces - blueprints for object shapes
// This is similar to PropTypes in JavaScript, but with compile-time checking

// Represents a single exercise set
export interface Set {
  id: number;
  weight: number;
  reps: number;
  // The '?' makes this property optional
  notes?: string;
  // Union type: can be either 'kg' or 'lb'
  unit: "kg" | "lb";
}

// Represents a workout session
export interface WorkoutSession {
  id: number;
  userId: number;
  exerciseId: number;
  date: string;
  notes?: string;
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
export type DateRange = "week" | "month" | "year" | "custom";

// Example of an enum - a way to define a set of named constants
export enum ChartType {
  Volume = "volume",
  MaxWeight = "maxWeight",
  TotalReps = "totalReps",
}
