import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Exercise, WorkoutSession, Set, DateRange } from "../types";
import WorkoutSet from "../components/WorkoutSet";
import VolumeChart from "../components/VolumeChart";

const ExerciseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("month");

  useEffect(() => {
    // TODO: Replace with actual API call
    // Simulating API call for now
    setLoading(true);
    const mockExercise: Exercise = {
      id: Number(id),
      name: "Bench Press",
      description: "Barbell bench press for chest development",
      workoutHistory: [],
    };
    setExercise(mockExercise);
    setLoading(false);
  }, [id]);

  const handleSaveWorkout = (sets: Set[], date: string) => {
    if (!exercise) return;

    const newWorkout: WorkoutSession = {
      id: Date.now(),
      exerciseId: exercise.id,
      date: new Date(date).toISOString(),
      sets,
      totalVolume: sets.reduce(
        (total, set) => total + set.weight * set.reps,
        0
      ),
    };

    // Sort workouts by date in descending order (newest first)
    const updatedWorkouts = [newWorkout, ...exercise.workoutHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setExercise({
      ...exercise,
      workoutHistory: updatedWorkouts,
    });
    setShowWorkoutModal(false);
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
        <h1 className="text-2xl text-red-500">Exercise not found</h1>
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
        <button
          onClick={() => setShowWorkoutModal(true)}
          className="btn-primary"
        >
          Record Workout
        </button>
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
            unit="kg" // TODO: Get from user preferences
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
                      {workout.totalVolume} {workout.sets[0]?.unit}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workout.sets.map((set, index) => (
                    <div
                      key={set.id}
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
      {showWorkoutModal && (
        <WorkoutSet
          onSave={handleSaveWorkout}
          onCancel={() => setShowWorkoutModal(false)}
          preferredUnit="kg" // TODO: Get from user preferences
        />
      )}
    </div>
  );
};

export default ExerciseDetail;
