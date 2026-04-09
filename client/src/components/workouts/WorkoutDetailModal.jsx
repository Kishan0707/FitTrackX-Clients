import { useMemo, useState } from "react";

import CompleteWorkoutModal from "./CompleteWorkoutModal";

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusToColor = {
  pending: "bg-yellow-500/20 text-yellow-300",
  in_progress: "bg-blue-500/20 text-blue-300",
  completed: "bg-emerald-500/20 text-emerald-300",
  skipped: "bg-red-500/20 text-red-300",
  cancelled: "bg-slate-600/20 text-slate-300",
};

const WorkoutDetailModal = ({ workout, onClose, onCompleted }) => {
  const [showComplete, setShowComplete] = useState(false);

  const coachName =
    workout?.coachId?.name || workout?.coach?.name || "Your Coach";
  const scheduledFor = workout?.scheduledFor || workout?.assignedAt;

  const exercisesSummary = useMemo(() => {
    if (!workout?.exercises?.length) return [];
    return workout.exercises;
  }, [workout]);

  if (!workout) return null;

  return (
    <>
      <div
        className='fixed inset-0 z-40 bg-black/70'
        onClick={onClose}
        aria-hidden='true'
      />
      <div className='fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl'>
        <button
          onClick={onClose}
          className='float-right text-slate-400 transition hover:text-white'
          aria-label='Close detail panel'>
          ✕
        </button>
        <div className='space-y-4 pt-3'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-xs uppercase tracking-[0.4em] text-slate-500'>
                Assigned workout
              </p>
              <h2 className='text-2xl font-bold text-white'>{workout.title}</h2>
              <p className='text-sm text-slate-400'>
                {workout.type?.replace("_", " ") || "Fitness session"} •{" "}
                {workout.duration || 0} min
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-1 text-xs font-semibold ${
                statusToColor[workout.status] || statusToColor.pending
              }`}>
              {workout.status?.replace("_", " ") || "pending"}
            </span>
          </div>

          <div className='grid gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-sm text-slate-300 sm:grid-cols-2'>
            <div>
              <p className='text-xs uppercase text-slate-500'>Coach</p>
              <p className='text-base font-medium text-white mt-1'>{coachName}</p>
            </div>
            <div>
              <p className='text-xs uppercase text-slate-500'>Scheduled</p>
              <p className='text-base font-medium text-white mt-1'>
                {formatDateTime(scheduledFor)}
              </p>
            </div>
            <div>
              <p className='text-xs uppercase text-slate-500'>Calories</p>
              <p className='text-lg font-semibold text-white mt-1'>
                {workout.caloriesBurned || 0} kcal
              </p>
            </div>
            <div>
              <p className='text-xs uppercase text-slate-500'>Duration</p>
              <p className='text-lg font-semibold text-white mt-1'>
                {workout.duration || 0} min
              </p>
            </div>
          </div>

          <section className='space-y-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4'>
            <h3 className='text-base font-semibold text-white'>Exercises</h3>
            {exercisesSummary.length === 0 ? (
              <p className='text-sm text-slate-400'>No exercises added yet.</p>
            ) : (
              <div className='grid gap-3'>
                {exercisesSummary.map((exercise, index) => (
                  <div
                    key={`${exercise.name}-${index}`}
                    className='rounded-2xl border border-white/5 bg-slate-900/60 p-3'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-semibold text-white'>
                        {exercise.name}
                      </p>
                      <span className='text-xs text-slate-400'>
                        #{index + 1}
                      </span>
                    </div>
                    <p className='text-xs text-slate-400'>
                      {exercise.sets || 0} sets × {exercise.reps || 0} reps
                      {exercise.weight ? ` • ${exercise.weight} kg` : ""}
                      {exercise.duration ? ` • ${exercise.duration} min` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {workout.status !== "completed" && (
            <button
              onClick={() => setShowComplete(true)}
              className='w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:opacity-90'>
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {showComplete && (
        <CompleteWorkoutModal
          workout={workout}
          onClose={() => setShowComplete(false)}
          onCompleted={(updatedWorkout) => {
            setShowComplete(false);
            onCompleted?.(updatedWorkout);
          }}
        />
      )}
    </>
  );
};

export default WorkoutDetailModal;
