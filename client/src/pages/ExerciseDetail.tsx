// Detailed view of an exercise, showing workout history and progress
// Provides functionality to record, edit, and delete workouts, and manage exercise details
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Exercise, WorkoutSession, Set } from "../types";
import { usePreferences } from "../contexts/PreferencesContext";
import { useAuth } from "../auth/AuthContext";
import WorkoutSet from "../components/WorkoutSet";
import VolumeChart from "../components/VolumeChart";
import ErrorToast from "../components/ErrorToast";
import ConfirmDialog from "../components/ConfirmDialog";

const MAX_NAME_LENGTH = 25;
const MAX_DESCRIPTION_LENGTH = 200;

const ExerciseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<number | null>(null);
  const [workoutToEdit, setWorkoutToEdit] = useState<WorkoutSession | null>(
    null
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Fetches exercise details and workout history
  const fetchExerciseData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        "[ExerciseDetail] Fetching exercise",
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
          "[ExerciseDetail] Failed to fetch exercise:",
          await exerciseResponse.text()
        );
        throw new Error("Failed to fetch exercise details");
      }

      const exerciseData = await exerciseResponse.json();
      console.log("[ExerciseDetail] Received exercise data:", exerciseData);

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
            "[ExerciseDetail] Failed to fetch workout sessions:",
            await workoutsResponse.text()
          );
          setError(
            "Unable to load workout history. The exercise data was loaded successfully."
          );
        } else {
          const workoutsData = await workoutsResponse.json();
          console.log(
            "[ExerciseDetail] Received workout history:",
            workoutsData
          );
          workoutHistory = workoutsData.data.workoutSessions;
        }
      } catch (workoutError) {
        console.error(
          "[ExerciseDetail] Error fetching workout sessions:",
          workoutError
        );
        setError(
          "Unable to load workout history. The exercise data was loaded successfully."
        );
      }

      setExercise({
        ...exerciseData.data.exercise,
        workoutHistory,
      });
      console.log("[ExerciseDetail] Updated exercise state:", {
        ...exerciseData.data.exercise,
        workoutHistory,
      });
    } catch (error) {
      console.error("[ExerciseDetail] Error fetching exercise data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load exercise data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load exercise data when component mounts or ID changes
  useEffect(() => {
    fetchExerciseData();
  }, [id]);

  // Initialize edit form with current exercise data
  useEffect(() => {
    if (exercise) {
      setEditedName(exercise.name);
      setEditedDescription(exercise.description || "");
    }
  }, [exercise]);

  // Handle clicks outside the settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsMenuRef.current &&
        settingsButtonRef.current &&
        !settingsMenuRef.current.contains(event.target as Node) &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Records a new workout session for the exercise
  const handleSaveWorkout = async (
    sets: Set[],
    date: string,
    sessionNotes: string
  ) => {
    if (!exercise) return;

    try {
      setError(null);
      const payload = {
        exerciseId: exercise.id,
        date,
        notes: sessionNotes,
        sets: sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
          notes: set.notes,
          unit: set.unit,
        })),
      };
      console.log("[ExerciseDetail] Saving workout with payload:", payload);

      const response = await fetch(`${API_URL}/api/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("[ExerciseDetail] Server response status:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("[ExerciseDetail] Server error response:", {
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
      console.log("[ExerciseDetail] Server success response:", responseData);

      await fetchExerciseData();
      setShowWorkoutModal(false);
    } catch (error) {
      console.error("[ExerciseDetail] Error saving workout:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError(
        error instanceof Error ? error.message : "Failed to save workout"
      );
    }
  };

  // Deletes a workout session
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

  // Updates an existing workout session
  const handleUpdateWorkout = async (
    sets: Set[],
    date: string,
    sessionNotes: string
  ) => {
    if (!workoutToEdit || !exercise) return;

    try {
      setError(null);
      // Convert weight and reps to numbers before sending
      const formattedSets = sets.map((set) => ({
        weight: parseFloat(set.weight.toString()),
        reps: parseInt(set.reps.toString(), 10),
        notes: set.notes,
        unit: set.unit,
      }));

      console.log(
        "[ExerciseDetail] Updating workout with formatted sets:",
        formattedSets
      );

      const response = await fetch(
        `${API_URL}/api/workouts/${workoutToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            exerciseId: exercise.id,
            date,
            notes: sessionNotes,
            sets: formattedSets,
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

  // Handles workout modal close with unsaved changes
  const handleCloseWorkoutModal = () => {
    if (workoutToEdit) {
      setShowEditConfirm(true);
    } else {
      setShowCancelConfirm(true);
    }
  };

  // Exports workout data in CSV or PDF format
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

  // Updates exercise details (name and description)
  const handleUpdateExercise = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/exercises/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editedName,
          description: editedDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update exercise");
      }

      await fetchExerciseData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating exercise:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update exercise"
      );
    }
  };

  // Deletes the entire exercise and its workout history
  const handleDeleteExercise = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/exercises/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete exercise");
      }

      navigate("/");
    } catch (error) {
      console.error("Error deleting exercise:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete exercise"
      );
    }
  };

  // Formats date for display in workout history
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handles exercise name input changes with character limit
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, MAX_NAME_LENGTH);
    setEditedName(newValue);
  };

  // Handles exercise description input changes with character limit
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
    setEditedDescription(newValue);
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
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 dark:text-gray-400 mb-2 hover:text-primary"
          >
            ← Back to Exercises
          </button>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={editedName}
                  onChange={handleNameChange}
                  className="input-field text-2xl font-bold w-full break-words"
                  placeholder="Exercise name"
                  maxLength={MAX_NAME_LENGTH}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editedName.length}/{MAX_NAME_LENGTH} characters
                </p>
              </div>
              <div>
                <textarea
                  value={editedDescription}
                  onChange={handleDescriptionChange}
                  className="input-field w-full break-words overflow-wrap-anywhere"
                  placeholder="Exercise description (optional)"
                  rows={2}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editedDescription.length}/{MAX_DESCRIPTION_LENGTH} characters
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateExercise}
                  className="btn-primary"
                  disabled={!editedName.trim()}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(exercise?.name || "");
                    setEditedDescription(exercise?.description || "");
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-secondary dark:text-white break-words">
                  {exercise?.name}
                </h1>
                {exercise?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2 break-words overflow-wrap-anywhere">
                    {exercise.description}
                  </p>
                )}
              </div>
              <div className="relative ml-4">
                <button
                  ref={settingsButtonRef}
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="btn-secondary p-2"
                  title="Exercise settings"
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                {showSettingsMenu && (
                  <div
                    ref={settingsMenuRef}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowSettingsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Edit Exercise
                      </button>
                      <button
                        onClick={() => {
                          handleExport("csv");
                          setShowSettingsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExport("pdf");
                          setShowSettingsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export PDF
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowSettingsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center border-t border-gray-200 dark:border-gray-700"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Delete Exercise
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="ml-4">
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
          </div>
          <VolumeChart
            workouts={exercise.workoutHistory}
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
                    {workout.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 break-words">
                        {workout.notes}
                      </p>
                    )}
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
          initialNotes={workoutToEdit?.notes}
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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise? This will permanently delete all associated workout data and cannot be undone."
        onConfirm={handleDeleteExercise}
        onCancel={() => setShowDeleteConfirm(false)}
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
