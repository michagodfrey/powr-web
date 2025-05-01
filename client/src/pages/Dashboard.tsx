// Main dashboard page that displays all user exercises
// Provides functionality to view, add, and manage exercises
import { useState, useEffect } from "react";
import { Exercise } from "../types";
import ExerciseForm from "../components/ExerciseForm";
import { useNavigate } from "react-router-dom";
import ErrorToast from "../components/ErrorToast";
import { useAuth } from "../auth/AuthContext";
import { api } from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches all exercises for the current user
  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Dashboard: Fetching exercises for user:", user?.id);

      const response = await api.get("/api/exercises");

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const data = await response.json();
      console.log("Dashboard: Received exercises:", data.data.exercises);
      setExercises(data.data.exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load exercises"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load exercises when component mounts
  useEffect(() => {
    fetchExercises();
  }, []);

  // Creates a new exercise and refreshes the list
  const handleCreateExercise = async (
    exerciseData: Omit<Exercise, "id" | "workoutHistory">
  ) => {
    try {
      setError(null);
      const response = await api.post("/api/exercises", exerciseData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create exercise");
      }

      await fetchExercises();
      setShowExerciseForm(false);
    } catch (error) {
      console.error("Error creating exercise:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create exercise"
      );
    }
  };

  // Navigates to the exercise detail page
  const handleExerciseClick = (exerciseId: number) => {
    navigate(`/exercise/${exerciseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary dark:text-white">
            My Exercises
          </h1>
        </div>
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
              <h3 className="text-xl font-semibold mb-2 break-words">
                {exercise.name}
              </h3>
              {exercise.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 break-words overflow-wrap-anywhere">
                  {exercise.description}
                </p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {exercise.workoutHistory?.length || 0} workout sessions
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

      {error && (
        <ErrorToast
          message={error}
          onClose={() => setError(null)}
          duration={5000}
        />
      )}
    </div>
  );
};

export default Dashboard;
