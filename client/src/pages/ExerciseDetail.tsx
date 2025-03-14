import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Exercise, WorkoutSession, Set, DateRange } from "../types";
import { usePreferences } from "../contexts/PreferencesContext";
import { useAuth } from "../auth/AuthContext";
import WorkoutSet from "../components/WorkoutSet";
import VolumeChart from "../components/VolumeChart";
import ErrorToast from "../components/ErrorToast";
import ConfirmDialog from "../components/ConfirmDialog";

const ExerciseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [workoutToDelete, setWorkoutToDelete] = useState<number | null>(null);
  const [workoutToEdit, setWorkoutToEdit] = useState<WorkoutSession | null>(
    null
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const fetchExerciseData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        "ExerciseDetail: Fetching exercise",
        id,
        "for user:",
        user?.id
      );

      // Fetch exercise details
      const exerciseResponse = await fetch(`${API_URL}/api/exercises/${id}`, {
        credentials: "include",
      });

      if (!exerciseResponse.ok) {
        console.error(
          "ExerciseDetail: Failed to fetch exercise:",
          await exerciseResponse.text()
        );
        throw new Error("Failed to fetch exercise details");
      }

      const exerciseData = await exerciseResponse.json();
      console.log("ExerciseDetail: Received exercise data:", exerciseData);

      // Fetch workout sessions
      let workoutHistory = [];
      try {
        const workoutsResponse = await fetch(
          `${API_URL}/api/workouts/exercise/${id}`,
          {
            credentials: "include",
          }
        );

        if (!workoutsResponse.ok) {
          console.warn(
            "Failed to fetch workout sessions:",
            await workoutsResponse.text()
          );
          setError(
            "Unable to load workout history. The exercise data was loaded successfully."
          );
        } else {
          const workoutsData = await workoutsResponse.json();
          workoutHistory = workoutsData.data.workoutSessions;
        }
      } catch (workoutError) {
        console.error("Error fetching workout sessions:", workoutError);
        setError(
          "Unable to load workout history. The exercise data was loaded successfully."
        );
      }

      setExercise({
        ...exerciseData.data.exercise,
        workoutHistory,
      });
    } catch (error) {
      console.error("Error fetching exercise data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load exercise data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseData();
  }, [id]);

  const handleSaveWorkout = async (sets: Set[], date: string) => {
    if (!exercise) return;

    try {
      setError(null);
      const payload = {
        exerciseId: exercise.id,
        date,
        sets: sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
          notes: set.notes,
          unit: set.unit,
        })),
      };
      console.log("[Workout] Saving workout with payload:", payload);

      const response = await fetch(`${API_URL}/api/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("[Workout] Server response status:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("[Workout] Server error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(
          errorData?.message || `Failed to save workout: ${response.statusText}`
        );
      }

      const responseData = await response.json();
      console.log("[Workout] Server success response:", responseData);

      await fetchExerciseData();
      setShowWorkoutModal(false);
    } catch (error) {
      console.error("[Workout] Error saving workout:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError(
        error instanceof Error ? error.message : "Failed to save workout"
      );
    }
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete workout");
      }

      await fetchExerciseData();
      setWorkoutToDelete(null);
    } catch (error) {
      console.error("Error deleting workout:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete workout"
      );
    }
  };

  const handleUpdateWorkout = async (sets: Set[], date: string) => {
    if (!workoutToEdit) return;

    try {
      setError(null);
      const response = await fetch(
        `${API_URL}/api/workouts/${workoutToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            date,
            sets,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update workout");
      }

      await fetchExerciseData();
      setWorkoutToEdit(null);
      setShowEditConfirm(false);
    } catch (error) {
      console.error("Error updating workout:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update workout"
      );
    }
  };

  const handleCloseWorkoutModal = () => {
    if (workoutToEdit) {
      setShowEditConfirm(true);
    } else {
      setShowCancelConfirm(true);
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      setError(null);
      const response = await fetch(
        `${API_URL}/api/export/${format}?exerciseId=${id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        // For error responses, try to parse as JSON first
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to export ${format.toUpperCase()}`
          );
        } else {
          // If not JSON, use the status text
          throw new Error(
            `Failed to export ${format.toUpperCase()}: ${response.statusText}`
          );
        }
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workouts-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      setError(
        error instanceof Error
          ? error.message
          : `Failed to export ${format.toUpperCase()}`
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 dark:text-gray-400 mb-4 hover:text-primary"
        >
          ← Back to Exercises
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h1 className="text-2xl text-red-600 dark:text-red-400 mb-2">
            Exercise not found
          </h1>
          <p className="text-red-600/80 dark:text-red-400/80">
            This exercise doesn't exist or you don't have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 dark:text-gray-400 mb-2 hover:text-primary"
          >
            ← Back to Exercises
          </button>
          <h1 className="text-3xl font-bold text-secondary dark:text-white">
            {exercise.name}
          </h1>
          {exercise.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {exercise.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="btn-secondary"
              title="Export as CSV"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="btn-secondary"
              title="Export as PDF"
            >
              Export PDF
            </button>
          </div>
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="btn-primary"
          >
            Record Workout
          </button>
        </div>
      </div>

      {/* Progress Chart */}
      {exercise.workoutHistory.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-secondary dark:text-white">
              Progress
            </h2>
            <div className="flex gap-2">
              {(["week", "month", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded ${
                    dateRange === range
                      ? "bg-primary text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <VolumeChart
            workouts={exercise.workoutHistory}
            dateRange={dateRange}
            unit={preferences.preferredUnit}
          />
        </div>
      )}

      {/* Workout History */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-secondary dark:text-white">
          Workout History
        </h2>
        {exercise.workoutHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              No workouts recorded yet
            </p>
            <button
              onClick={() => setShowWorkoutModal(true)}
              className="mt-4 btn-primary"
            >
              Record Your First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exercise.workoutHistory.map((workout) => (
              <div
                key={workout.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-secondary dark:text-white">
                      {formatDate(workout.date)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {workout.sets.length} sets · Total Volume:{" "}
                      {workout.totalVolume.toFixed(1)} {workout.unit}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWorkoutToEdit(workout)}
                      className="text-primary hover:text-primary-dark transition-colors"
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
                      onClick={() => setWorkoutToDelete(workout.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workout.sets.map((set, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 p-3 rounded"
                    >
                      <div className="text-sm font-medium">Set {index + 1}</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {set.weight} {set.unit} × {set.reps} reps
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WorkoutSet Modal */}
      {(showWorkoutModal || workoutToEdit) && (
        <WorkoutSet
          onSave={workoutToEdit ? handleUpdateWorkout : handleSaveWorkout}
          onCancel={handleCloseWorkoutModal}
          initialSets={workoutToEdit?.sets}
          initialDate={workoutToEdit?.date}
          preferredUnit={preferences.preferredUnit}
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={workoutToDelete !== null}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        onConfirm={() =>
          workoutToDelete && handleDeleteWorkout(workoutToDelete)
        }
        onCancel={() => setWorkoutToDelete(null)}
      />

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancel Workout Entry"
        message="Are you sure you want to cancel? Any unsaved changes will be lost."
        onConfirm={() => {
          setShowCancelConfirm(false);
          setShowWorkoutModal(false);
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showEditConfirm}
        title="Cancel Edit"
        message="Are you sure you want to cancel? Any unsaved changes will be lost."
        onConfirm={() => {
          setShowEditConfirm(false);
          setWorkoutToEdit(null);
        }}
        onCancel={() => setShowEditConfirm(false)}
      />

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

export default ExerciseDetail;
