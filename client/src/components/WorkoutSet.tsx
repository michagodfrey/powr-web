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

  // Use the original unit from the first set when editing, otherwise use preferred unit
  const displayUnit =
    initialSets.length > 0 ? initialSets[0].unit : preferredUnit;

  const [sets, setSets] = useState<Set[]>(
    initialSets.length > 0
      ? initialSets.map((set, index) => ({
          ...set,
          id: Date.now() * 1000 + index, // Ensure unique ID for each initial set
          weight:
            typeof set.weight === "string"
              ? parseFloat(set.weight)
              : set.weight,
          reps:
            typeof set.reps === "string" ? parseInt(set.reps, 10) : set.reps,
          unit: set.unit || displayUnit, // Ensure unit is set
        }))
      : [{ id: Date.now(), weight: 0, reps: 0, unit: displayUnit }]
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
    const newId = Date.now() * 1000 + sets.length; // Use length as offset for uniqueness
    setSets([
      ...sets,
      {
        id: newId,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
        unit: displayUnit,
        setNumber: sets.length + 1,
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
    const baseTimestamp = Date.now() * 1000;
    const newSets: Set[] = Array.from({ length: scheme.sets }, (_, index) => ({
      id: baseTimestamp + index, // Use index as offset for uniqueness
      weight: lastWeight,
      reps: scheme.reps,
      unit: displayUnit,
      setNumber: index + 1,
    }));
    setSets(newSets);
  };

  // Sort sets by setNumber if available, otherwise by array index
  const sortedSets = [...sets]
    .map((set, index) => ({
      ...set,
      setNumber: set.setNumber || index + 1,
    }))
    .sort((a, b) => a.setNumber - b.setNumber);

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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sets
          </label>
          {/* Show notice about original units when editing */}
          {initialSets.length > 0 && displayUnit !== preferredUnit && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This workout was recorded in {displayUnit}.{" "}
              {displayUnit === "kg" ? <>1 kg ≈ 2.20 lb</> : <>1 lb ≈ 0.45 kg</>}
            </div>
          )}
          <div className="space-y-4">
            {sortedSets.map((set, index) => (
              <div
                key={set.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="font-mono text-lg">{index + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) =>
                        handleSetUpdate(set.id, "weight", e.target.value)
                      }
                      className="input-field"
                      min="0"
                      aria-label={`Weight for set ${index + 1}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
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
                    {index === sets.length - 1 && (
                      <button
                        onClick={handleAddSet}
                        className="self-end h-10 w-10 flex items-center justify-center text-lg font-bold border-2 border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
                        aria-label="Add new set"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
                {sets.length > 1 && (
                  <button
                    onClick={() => handleRemoveSet(set.id)}
                    className="self-end h-10 w-10 flex items-center justify-center text-lg font-bold border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Delete set"
                  >
                    ×
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
