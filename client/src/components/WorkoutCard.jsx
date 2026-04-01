import API from "../services/api";
import { useState } from "react";

const WorkoutCard = ({ workout, setWorkouts }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const getWorkoutColor = (type) => {
    const colors = {
      cardio: "from-red-500 to-red-600",
      strength: "from-blue-500 to-blue-600",
      flexibility: "from-green-500 to-green-600",
      balance: "from-yellow-500 to-yellow-600",
      gym: "from-purple-500 to-purple-600",
      home: "from-orange-500 to-orange-600",
      run: "from-pink-500 to-pink-600",
      boxing: "from-indigo-500 to-indigo-600",
    };
    return colors[type] || "from-slate-500 to-slate-600";
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      cardio: "🏃",
      strength: "💪",
      flexibility: "🧘",
      balance: "⚖️",
      gym: "🏋️",
      home: "🏠",
      run: "🚶",
      boxing: "👊",
    };
    return icons[type] || "💪";
  };

  const deleteWorkout = async () => {
    try {
      setDeleting(true);
      console.log("Deleting workout with ID:", workout._id);
      const res = await API.delete(`/workouts/${workout._id}`);
      console.log("Delete response:", res);

      // Update the parent state to remove this workout
      setWorkouts((prevWorkouts) =>
        prevWorkouts.filter((w) => w._id !== workout._id),
      );
      setSuccess("Workout deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
      setError("");
    } catch (error) {
      console.error("Failed to delete workout:", error);
      console.error("Error response:", error.response?.data);
      setError(
        `Failed to delete workout: ${error.response?.data?.message || error.message}`,
      );
      setTimeout(() => setError(""), 3000);
      setSuccess("");
      setDeleting(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/50 transform hover:-translate-y-1">
      {/* Header with Gradient */}

      <div className={`bg-gradient-to-r ${getWorkoutColor(workout.type)} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getWorkoutIcon(workout.type)}</span>
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {workout.type}
              </h2>
              <p className="text-white/80 text-sm">Workout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Duration */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-xs font-bold uppercase mb-1">
              Duration
            </p>
            <p className="text-white text-2xl font-bold">{workout.duration}</p>
            <p className="text-blue-300 text-xs">minutes</p>
          </div>

          {/* Calories */}
          <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4">
            <p className="text-orange-400 text-xs font-bold uppercase mb-1">
              Calories
            </p>
            <p className="text-white text-2xl font-bold">
              {workout.caloriesBurned}
            </p>
            <p className="text-orange-300 text-xs">burned</p>
          </div>

          {/* Date */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-400 text-xs font-bold uppercase mb-1">
              Date
            </p>
            <p className="text-white text-sm font-bold">
              {formatDate(workout.createdAt)}
            </p>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
            <span>📋</span>
            Exercises ({workout.exercises?.length || 0})
          </h3>

          {workout.exercises && workout.exercises.length > 0 ? (
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <p className="text-white font-bold text-lg">
                          {exercise.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-slate-400 text-xs">Sets</p>
                          <p className="text-white font-bold">
                            {exercise.sets}
                          </p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-slate-400 text-xs">Reps</p>
                          <p className="text-white font-bold">
                            {exercise.reps}
                          </p>
                        </div>
                        {exercise.weight && (
                          <div className="bg-slate-900/50 rounded p-2">
                            <p className="text-slate-400 text-xs">Weight</p>
                            <p className="text-white font-bold">
                              {exercise.weight} kg
                            </p>
                          </div>
                        )}
                        {exercise.duration && (
                          <div className="bg-slate-900/50 rounded p-2">
                            <p className="text-slate-400 text-xs">Duration</p>
                            <p className="text-white font-bold">
                              {exercise.duration} min
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
              <p className="text-slate-400 text-sm">
                No exercises recorded for this workout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <div className="border-t border-slate-700 p-6">
        <button
          onClick={deleteWorkout}
          disabled={deleting}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {deleting ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Deleting...
            </>
          ) : (
            <>
              <span>🗑️</span>
              Delete Workout
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkoutCard;
