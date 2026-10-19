// Modal form component for creating or editing exercises
// Handles input validation and character limits for exercise name and description
import { useState } from "react";
import { Exercise, ExerciseType } from "../types";
import { EXERCISE_TYPE_OPTIONS } from "../utils/exerciseMetrics";

interface ExerciseFormProps {
  onSubmit: (exercise: Omit<Exercise, "id" | "workoutHistory">) => void;
  onCancel: () => void;
}

const MAX_NAME_LENGTH = 25;
const MAX_DESCRIPTION_LENGTH = 200;

const ExerciseForm = ({ onSubmit, onCancel }: ExerciseFormProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    exerciseType: ExerciseType;
  }>({
    name: "",
    description: "",
    exerciseType: "weighted",
  });

  // Handles name input changes with character limit enforcement
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, MAX_NAME_LENGTH);
    setFormData((prev) => ({ ...prev, name: newValue }));
  };

  // Handles description input changes with character limit enforcement
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
    setFormData((prev) => ({ ...prev, description: newValue }));
  };

  // Submits the form data after trimming whitespace
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      exerciseType: formData.exerciseType,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-secondary rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-secondary dark:text-white">
          Add New Exercise
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Exercise Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              className="input-field"
              placeholder="e.g., Bench Press"
              maxLength={MAX_NAME_LENGTH}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.name.length}/{MAX_NAME_LENGTH} characters
            </p>
          </div>

          {/* Type is fixed once created, since it decides what each set records */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Tracking
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {EXERCISE_TYPE_OPTIONS.map((option) => {
                const selected = formData.exerciseType === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex flex-col cursor-pointer rounded-lg border-2 p-2 text-center transition-colors focus-within:ring-2 focus-within:ring-primary/50 ${
                      selected
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exerciseType"
                      value={option.value}
                      checked={selected}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          exerciseType: option.value,
                        }))
                      }
                      className="sr-only"
                      aria-label={`${option.label}: ${option.description}`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        selected
                          ? "text-primary"
                          : "text-secondary dark:text-white"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              className="input-field min-h-[100px]"
              placeholder="Add notes or description about the exercise..."
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.name.trim()}
            >
              Create Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseForm;
