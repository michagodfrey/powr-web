import { useState } from "react";
import { Set } from "../types";

interface WorkoutSetProps {
  onSave: (sets: Set[], date: string) => void;
  onCancel: () => void;
  initialSets?: Set[];
  initialDate?: string;
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
  preferredUnit = "kg",
}: WorkoutSetProps) => {
  const [sets, setSets] = useState<Set[]>(
    initialSets.length > 0
      ? initialSets
      : [{ id: Date.now(), weight: 0, reps: 0, unit: preferredUnit }]
  );

  // Initialize with provided date or current date in YYYY-MM-DD format
  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );

  // Calculate total volume for all sets
  const calculateTotalVolume = () => {
    return sets.reduce((total, set) => total + set.weight * set.reps, 0);
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
    value: number
  ) => {
    setSets(
      sets.map((set) => (set.id === id ? { ...set, [field]: value } : set))
    );
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-secondary rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-secondary dark:text-white">
          {initialSets ? "Edit Workout" : "Record Sets"}
        </h2>

        {/* Date Selection */}
        <div className="mb-6">
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
        <div className="mb-6">
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

        {/* Sets input */}
        <div className="space-y-4 mb-6">
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
                      handleSetUpdate(set.id, "weight", Number(e.target.value))
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
                      handleSetUpdate(set.id, "reps", Number(e.target.value))
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

        {/* Total volume */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Volume
          </div>
          <div className="text-2xl font-bold text-primary">
            {calculateTotalVolume()} {preferredUnit}
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
              onClick={() => onSave(sets, date)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              disabled={sets.length === 0}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSet;
