// Modal component for recording or editing workout sets
// Manages set/rep tracking with weight units and session notes
import { useState } from "react";
import { Set } from "../types";
import { calculateTotalVolume } from "../utils/volumeCalculation";

interface WorkoutSetProps {
  onSave: (sets: Set[], date: string, sessionNotes: string) => void;
  onCancel: () => void;
  initialSets?: Set[];
  initialDate?: string;
  initialNotes?: string;
  preferredUnit?: "kg" | "lb";
}

// Common set/rep schemes for quick selection
const COMMON_SCHEMES = [
  { name: "5x5", sets: 5, reps: 5 },
  { name: "3x12", sets: 3, reps: 12 },
  { name: "4x8", sets: 4, reps: 8 },
];

const WorkoutSet = ({
  onSave,
  onCancel,
  initialSets = [],
  initialDate,
  initialNotes = "",
  preferredUnit = "kg",
}: WorkoutSetProps) => {
  // Add debug logging for edit mode
  console.log("[WorkoutSet] Initializing with:", {
    initialSets,
    initialDate,
    initialNotes,
    preferredUnit,
  });

  const [sets, setSets] = useState<Set[]>(
    initialSets.length > 0
      ? initialSets
      : [{ id: Date.now(), weight: 0, reps: 0, unit: preferredUnit }]
  );

  // Initialize with provided date or current date in YYYY-MM-DD format
  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );

  // Add state for session notes, ensuring it's always a string
  const [sessionNotes, setSessionNotes] = useState(initialNotes ?? "");

  // Log state after initialization
  console.log("[WorkoutSet] State initialized:", {
    sets,
    date,
    sessionNotes,
  });

  // Calculate total volume using the utility function
  const getTotalVolume = () => {
    try {
      return calculateTotalVolume(sets, preferredUnit);
    } catch (error) {
      console.error("Error calculating volume:", error);
      return 0;
    }
  };

  // Add a new set
  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        id: Date.now(),
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
        unit: preferredUnit,
      },
    ]);
  };

  // Remove a set
  const handleRemoveSet = (id: number) => {
    setSets(sets.filter((set) => set.id !== id));
  };

  // Update a set's values
  const handleSetUpdate = (
    id: number,
    field: "weight" | "reps",
    value: number | string
  ) => {
    // Convert value to appropriate type
    const numericValue =
      field === "weight"
        ? parseFloat(value.toString())
        : parseInt(value.toString(), 10);

    // Only update if it's a valid number
    if (!isNaN(numericValue)) {
      setSets(
        sets.map((set) =>
          set.id === id ? { ...set, [field]: numericValue } : set
        )
      );
    }
  };

  // Apply a common set/rep scheme
  const applyScheme = (scheme: { sets: number; reps: number }) => {
    const lastWeight = sets[0]?.weight || 0;
    const newSets: Set[] = Array.from({ length: scheme.sets }, (_, i) => ({
      id: Date.now() + i,
      weight: lastWeight,
      reps: scheme.reps,
      unit: preferredUnit,
    }));
    setSets(newSets);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="my-auto bg-white dark:bg-secondary rounded-lg w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* Fixed Header */}
        <div className="shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-secondary dark:text-white">
            {initialSets ? "Edit Workout" : "Record Sets"}
          </h2>

          {/* Date Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workout Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split("T")[0]}
              aria-label="Workout date"
            />
          </div>

          {/* Quick scheme selection */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Schemes
            </h3>
            <div className="flex gap-2">
              {COMMON_SCHEMES.map((scheme) => (
                <button
                  key={scheme.name}
                  onClick={() => applyScheme(scheme)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {scheme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Session Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Notes
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="input-field min-h-[80px] resize-y"
              placeholder="How was your workout? Any variations or notes to remember?"
              aria-label="Session notes"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-4">
            {sets.map((set, index) => (
              <div
                key={set.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="font-mono text-lg">{index + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight ({preferredUnit})
                    </label>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) =>
                        handleSetUpdate(set.id, "weight", e.target.value)
                      }
                      className="input-field"
                      min="0"
                      step="0.5"
                      aria-label={`Weight for set ${index + 1}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        handleSetUpdate(set.id, "reps", e.target.value)
                      }
                      className="input-field"
                      min="0"
                      aria-label={`Reps for set ${index + 1}`}
                    />
                  </div>
                </div>
                {sets.length > 1 && (
                  <button
                    onClick={() => handleRemoveSet(set.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Total volume */}
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Volume
            </div>
            <div className="text-2xl font-bold text-primary">
              {getTotalVolume().toFixed(2)} {preferredUnit}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handleAddSet}
              className="px-4 py-2 text-primary border-2 border-primary rounded hover:bg-primary hover:text-white transition-colors"
            >
              Add Set
            </button>
            <div className="space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("[WorkoutSet] Saving workout:", {
                    sets,
                    date,
                    sessionNotes,
                  });
                  onSave(sets, date, sessionNotes);
                }}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                disabled={sets.length === 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSet;
