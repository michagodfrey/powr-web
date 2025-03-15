import { useState } from "react";
import { Exercise } from "../types";

interface ExerciseFormProps {
  onSubmit: (exercise: Omit<Exercise, "id" | "workoutHistory">) => void;
  onCancel: () => void;
}

const ExerciseForm = ({ onSubmit, onCancel }: ExerciseFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = Date.now();
    onSubmit({
      name: `${formData.name.trim()}_${timestamp}`,
      description: formData.description.trim(),
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-field"
              placeholder="e.g., Bench Press"
              required
            />
          </div>

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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input-field min-h-[100px]"
              placeholder="Add notes or description about the exercise..."
            />
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
