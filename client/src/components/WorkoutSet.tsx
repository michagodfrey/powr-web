// Modal component for recording or editing workout sets
// Manages set/rep tracking with weight units and session notes
import { useEffect, useRef, useState } from "react";
import { Set } from "../types";
import { calculateTotalVolume } from "../utils/volumeCalculation";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { parseVoiceInput } from "../utils/parseVoiceInput";

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
  const isEditMode = initialSets.length > 0;

  // Use the original unit from the first set when editing, otherwise use preferred unit
  const displayUnit = isEditMode ? initialSets[0].unit : preferredUnit;

  const [sets, setSets] = useState<Set[]>(
    isEditMode
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

  // Session notes are collapsed by default unless there's already something to show
  const [sessionNotes, setSessionNotes] = useState(initialNotes ?? "");
  const [notesExpanded, setNotesExpanded] = useState(!!initialNotes);

  // Weight to apply when a quick scheme is tapped, so sets aren't created at 0
  const [schemeWeight, setSchemeWeight] = useState<string>("");

  // Voice data entry: say a set out loud (e.g. "135 for 8") to append it hands-free
  const {
    isSupported: isVoiceSupported,
    isListening,
    transcript,
    error: voiceError,
    start: startListening,
    stop: stopListening,
  } = useVoiceInput();
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const lastHandledTranscript = useRef<string | null>(null);

  useEffect(() => {
    if (isListening || !transcript || transcript === lastHandledTranscript.current) {
      return;
    }
    lastHandledTranscript.current = transcript;

    const parsed = parseVoiceInput(transcript);
    if (!parsed) {
      setVoiceMessage(`Didn't catch that ("${transcript}"). Try again.`);
      return;
    }

    setSets((prev) => [
      ...prev,
      {
        id: Date.now() * 1000 + prev.length,
        weight: parsed.weight,
        reps: parsed.reps,
        unit: displayUnit,
        setNumber: prev.length + 1,
      },
    ]);
    setVoiceMessage(`Logged ${parsed.weight}${displayUnit} × ${parsed.reps} reps`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  useEffect(() => {
    if (voiceError) {
      setVoiceMessage(voiceError);
    }
  }, [voiceError]);

  useEffect(() => {
    if (!voiceMessage) return;
    const timeout = setTimeout(() => setVoiceMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [voiceMessage]);

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

  // Apply a common set/rep scheme, using the entered weight (falling back to the current first-set weight)
  const applyScheme = (scheme: { sets: number; reps: number }) => {
    const parsedWeight = parseFloat(schemeWeight);
    const weight = schemeWeight.trim() !== "" && !isNaN(parsedWeight)
      ? parsedWeight
      : sets[0]?.weight || 0;
    const baseTimestamp = Date.now() * 1000;
    const newSets: Set[] = Array.from({ length: scheme.sets }, (_, index) => ({
      id: baseTimestamp + index, // Use index as offset for uniqueness
      weight,
      reps: scheme.reps,
      unit: displayUnit,
      setNumber: index + 1,
    }));
    setSets(newSets);
  };

  const handleSave = () => {
    onSave(sets, date, sessionNotes);
  };

  // Sort sets by setNumber if available, otherwise by array index
  const sortedSets = [...sets]
    .map((set, index) => ({
      ...set,
      setNumber: set.setNumber || index + 1,
    }))
    .sort((a, b) => a.setNumber - b.setNumber);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex sm:items-center sm:justify-center sm:p-4">
      <div
        className="bg-white dark:bg-secondary w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:rounded-lg sm:max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary dark:text-white">
              {isEditMode ? "Edit Workout" : "Record Sets"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="shrink-0 -m-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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
            <div className="flex items-end gap-2 mb-2">
              <div className="w-28">
                <label
                  htmlFor="scheme-weight"
                  className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                >
                  Weight ({displayUnit})
                </label>
                <input
                  id="scheme-weight"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={schemeWeight}
                  onChange={(e) => setSchemeWeight(e.target.value)}
                  placeholder="0"
                  className="input-field py-2"
                  aria-label={`Weight to apply for quick scheme, in ${displayUnit}`}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_SCHEMES.map((scheme) => (
                <button
                  key={scheme.name}
                  onClick={() => applyScheme(scheme)}
                  className="min-h-[44px] px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all"
                >
                  {scheme.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sets */}
        <div className="p-4 sm:p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sets
          </label>
          {/* Show notice about original units when editing */}
          {isEditMode && displayUnit !== preferredUnit && (
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              This workout was recorded in {displayUnit}.{" "}
              {displayUnit === "kg" ? <>1 kg ≈ 2.20 lb</> : <>1 lb ≈ 0.45 kg</>}
            </div>
          )}
          <div className="space-y-3">
            {sortedSets.map((set, index) => (
              <div
                key={set.id}
                className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="font-mono text-sm text-gray-500 dark:text-gray-400 w-5 shrink-0 text-center">
                  {index + 1}
                </span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`weight-${set.id}`}
                      className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                    >
                      Weight ({displayUnit})
                    </label>
                    <input
                      id={`weight-${set.id}`}
                      type="number"
                      inputMode="decimal"
                      value={set.weight}
                      onChange={(e) =>
                        handleSetUpdate(set.id, "weight", e.target.value)
                      }
                      className="input-field py-2"
                      min="0"
                      aria-label={`Weight for set ${index + 1}`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`reps-${set.id}`}
                      className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                    >
                      Reps
                    </label>
                    <input
                      id={`reps-${set.id}`}
                      type="number"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(e) =>
                        handleSetUpdate(set.id, "reps", e.target.value)
                      }
                      className="input-field py-2"
                      min="0"
                      aria-label={`Reps for set ${index + 1}`}
                    />
                  </div>
                </div>
                {sets.length > 1 && (
                  <button
                    onClick={() => handleRemoveSet(set.id)}
                    className="shrink-0 self-end h-11 w-11 flex items-center justify-center text-lg font-bold text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
                    aria-label={`Delete set ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddSet}
            className="w-full mt-3 min-h-[48px] px-4 py-3 text-primary border-2 border-dashed border-primary/50 rounded-lg hover:bg-primary/5 active:scale-[0.99] transition-all font-medium"
          >
            + Add Set
          </button>
        </div>

        {/* Session Notes — collapsed by default, sits above the footer actions */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setNotesExpanded((expanded) => !expanded)}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-3 text-left"
            aria-expanded={notesExpanded}
            aria-controls="session-notes-panel"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Notes{sessionNotes && !notesExpanded ? " · added" : ""}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                notesExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {notesExpanded && (
            <div id="session-notes-panel" className="px-4 sm:px-6 pb-4">
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="How was your workout? Any variations or notes to remember?"
                aria-label="Session notes"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Total volume */}
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Volume
            </div>
            <div className="text-2xl font-bold text-primary">
              {getTotalVolume().toFixed(2)} {preferredUnit}
            </div>
          </div>

          {/* Voice input feedback */}
          {voiceMessage && (
            <div
              className="mb-3 text-sm text-gray-700 dark:text-gray-300"
              role="status"
            >
              {voiceMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isVoiceSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                aria-label={
                  isListening ? "Stop voice input" : "Add set by voice"
                }
                aria-pressed={isListening}
                className={`shrink-0 h-11 w-11 flex items-center justify-center rounded-full border-2 transition-colors ${
                  isListening
                    ? "border-red-500 text-red-500 animate-pulse"
                    : "border-primary text-primary hover:bg-primary hover:text-white"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3z" />
                  <path d="M17 11a1 1 0 10-2 0 3 3 0 01-6 0 1 1 0 10-2 0 5 5 0 004 4.9V18H9a1 1 0 100 2h6a1 1 0 100-2h-2v-2.1a5 5 0 004-4.9z" />
                </svg>
              </button>
            )}
            <div className="flex-1 grid grid-cols-2 gap-2">
              <button
                onClick={onCancel}
                className="w-full px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
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
