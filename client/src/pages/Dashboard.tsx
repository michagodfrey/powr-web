import { useState } from "react";
import { Exercise } from "../types";
import ExerciseForm from "../components/ExerciseForm";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  const handleCreateExercise = (
    exerciseData: Omit<Exercise, "id" | "workoutHistory">
  ) => {
    // In a real app, this would be an API call
    const newExercise: Exercise = {
      id: Date.now(), // Temporary ID generation
      workoutHistory: [],
      ...exerciseData,
    };

    setExercises((prev) => [...prev, newExercise]);
    setShowExerciseForm(false);
  };

  const handleExerciseClick = (exerciseId: number) => {
    navigate(`/exercise/${exerciseId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary dark:text-white">
          My Exercises
        </h1>
        <button
          onClick={() => setShowExerciseForm(true)}
          className="btn-primary"
        >
          Add Exercise
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No exercises added yet
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowExerciseForm(true)}
            >
              Add Your First Exercise
            </button>
          </div>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleExerciseClick(exercise.id)}
            >
              <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
              {exercise.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {exercise.description}
                </p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {exercise.workoutHistory.length} workout sessions
              </div>
            </div>
          ))
        )}
      </div>

      {showExerciseForm && (
        <ExerciseForm
          onSubmit={handleCreateExercise}
          onCancel={() => setShowExerciseForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
