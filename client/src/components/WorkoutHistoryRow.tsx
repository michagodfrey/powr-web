// Collapsible row in an exercise's workout history
// Shows date and the session total (volume, reps, or time by exercise type);
// expands to reveal notes and per-set details
import { useState } from "react";
import { ExerciseType, Set, WorkoutSession } from "../types";
import { parseWorkoutDate } from "../utils/workoutDate";
import {
  formatDuration,
  repsPerSet,
  sumDuration,
  sumReps,
} from "../utils/exerciseMetrics";

interface WorkoutHistoryRowProps {
  workout: WorkoutSession;
  exerciseType?: ExerciseType;
  onEdit: (workout: WorkoutSession) => void;
  onDelete: (workoutId: number) => void;
}

// One-line session total for the collapsed row
const formatSessionSummary = (
  workout: WorkoutSession,
  exerciseType: ExerciseType
) => {
  switch (exerciseType) {
    case "reps":
      return `Total Reps: ${sumReps(workout.sets)} · ${repsPerSet(
        workout.sets
      ).toFixed(1)} reps/set`;
    case "timed":
      return `Total Time: ${formatDuration(sumDuration(workout.sets))}`;
    case "weighted":
    default:
      return `Total Volume: ${workout.totalVolume.toFixed(1)} ${workout.unit}`;
  }
};

// Per-set detail for the expanded row
const formatSetDetail = (set: Set, exerciseType: ExerciseType) => {
  switch (exerciseType) {
    case "reps":
      return `${set.reps} reps`;
    case "timed":
      return formatDuration(set.durationSeconds ?? 0);
    case "weighted":
    default:
      return `${set.weight} ${set.unit} × ${set.reps} reps`;
  }
};

// Formats date for display in workout history
const formatDate = (dateString: string) =>
  parseWorkoutDate(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const WorkoutHistoryRow = ({
  workout,
  exerciseType = "weighted",
  onEdit,
  onDelete,
}: WorkoutHistoryRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `workout-${workout.id}-sets`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center gap-2 p-3 sm:p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 min-w-0 items-center gap-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 -m-1 p-1 transition-colors"
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={`${expanded ? "Hide" : "Show"} sets for ${formatDate(
            workout.date
          )}`}
        >
          <svg
            className={`w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="min-w-0">
            <h3 className="font-semibold text-secondary dark:text-white">
              {formatDate(workout.date)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatSessionSummary(workout, exerciseType)}
              <span className="text-gray-400 dark:text-gray-500">
                {" "}
                · {workout.sets.length}{" "}
                {workout.sets.length === 1 ? "set" : "sets"}
              </span>
            </p>
          </div>
        </button>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(workout)}
            className="h-10 w-10 flex items-center justify-center text-primary hover:text-primary-dark hover:bg-primary/5 rounded-lg transition-colors"
            aria-label="Edit workout"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(workout.id)}
            className="h-10 w-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label="Delete workout"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div
          id={detailsId}
          className="border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3"
        >
          {workout.notes && (
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 break-words">
              {workout.notes}
            </p>
          )}
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {workout.sets.map((set, index) => (
              <li
                key={index}
                className="flex justify-between py-2 text-sm"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Set {index + 1}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {formatSetDetail(set, exerciseType)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistoryRow;
