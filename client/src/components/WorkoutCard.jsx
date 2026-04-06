import { useState } from "react";
import API from "../services/api";

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

const getWorkoutCode = (type) => {
  const labels = {
    cardio: "CRD",
    strength: "STR",
    flexibility: "FLX",
    balance: "BAL",
    gym: "GYM",
    home: "HME",
    run: "RUN",
    boxing: "BOX",
  };

  return labels[type] || "WRK";
};

const WorkoutCard = ({ workout, setWorkouts }) => {
  const [deleting, setDeleting] = useState(false);
  const canDelete = typeof setWorkouts === "function";

  const deleteWorkout = async () => {
    try {
      setDeleting(true);
      await API.delete(`/workouts/${workout._id}`);

      if (canDelete) {
        setWorkouts((prevWorkouts) =>
          prevWorkouts.filter((item) => item._id !== workout._id),
        );
      }
    } catch (error) {
      console.error("Failed to delete workout:", error);
    } finally {
      setDeleting(false);
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
    <div className='transform overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-900/50'>
      <div
        className={`bg-linear-to-r ${getWorkoutColor(workout.type)} p-4 sm:p-6`}>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xs font-black tracking-[0.2em] text-white backdrop-blur'>
              {getWorkoutCode(workout.type)}
            </div>
            <div className='min-w-0'>
              <h2 className='truncate text-xl font-bold capitalize text-white sm:text-2xl'>
                {workout.type}
              </h2>
              <p className='text-sm text-white/80'>Workout</p>
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-6 p-4 sm:p-6'>
        <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3'>
          <div className='rounded-lg border border-blue-500/30 bg-blue-900/30 p-4'>
            <p className='mb-1 text-xs font-bold uppercase text-blue-400'>
              Duration
            </p>
            <p className='text-2xl font-bold text-white'>{workout.duration}</p>
            <p className='text-xs text-blue-300'>minutes</p>
          </div>

          <div className='rounded-lg border border-orange-500/30 bg-orange-900/30 p-4'>
            <p className='mb-1 text-xs font-bold uppercase text-orange-400'>
              Calories
            </p>
            <p className='text-2xl font-bold text-white'>
              {workout.caloriesBurned}
            </p>
            <p className='text-xs text-orange-300'>burned</p>
          </div>

          <div className='rounded-lg border border-purple-500/30 bg-purple-900/30 p-4'>
            <p className='mb-1 text-xs font-bold uppercase text-purple-400'>
              Date
            </p>
            <p className='text-sm font-bold text-white'>
              {formatDate(workout.createdAt)}
            </p>
          </div>
        </div>

        <div className='border-t border-slate-700 pt-6'>
          <h3 className='mb-4 text-base font-bold text-white sm:text-lg'>
            Exercises ({workout.exercises?.length || 0})
          </h3>

          {workout.exercises && workout.exercises.length > 0 ?
            <div className='space-y-3'>
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className='rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 transition-all duration-300 hover:border-slate-600'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex flex-wrap items-center gap-3'>
                        <span className='rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white'>
                          #{index + 1}
                        </span>
                        <p className='text-base font-bold text-white sm:text-lg'>
                          {exercise.name}
                        </p>
                      </div>
                      <div className='mt-3 grid grid-cols-2 gap-3 md:grid-cols-4'>
                        <div className='rounded bg-slate-900/50 p-2'>
                          <p className='text-xs text-slate-400'>Sets</p>
                          <p className='font-bold text-white'>
                            {exercise.sets}
                          </p>
                        </div>
                        <div className='rounded bg-slate-900/50 p-2'>
                          <p className='text-xs text-slate-400'>Reps</p>
                          <p className='font-bold text-white'>
                            {exercise.reps}
                          </p>
                        </div>
                        {exercise.weight ?
                          <div className='rounded bg-slate-900/50 p-2'>
                            <p className='text-xs text-slate-400'>Weight</p>
                            <p className='font-bold text-white'>
                              {exercise.weight} kg
                            </p>
                          </div>
                        : null}
                        {exercise.duration ?
                          <div className='rounded bg-slate-900/50 p-2'>
                            <p className='text-xs text-slate-400'>Duration</p>
                            <p className='font-bold text-white'>
                              {exercise.duration} min
                            </p>
                          </div>
                        : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          : <div className='rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center'>
              <p className='text-sm text-slate-400'>
                No exercises recorded for this workout
              </p>
            </div>
          }
        </div>
      </div>

      {canDelete ?
        <div className='border-t border-slate-700 p-4 sm:p-6'>
          <button
            onClick={deleteWorkout}
            disabled={deleting}
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 font-bold text-white transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100'>
            {deleting ?
              <>
                <svg
                  className='h-5 w-5 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Deleting...
              </>
            : "Delete Workout"}
          </button>
        </div>
      : null}
    </div>
  );
};

export default WorkoutCard;
