import { useState } from "react";

import API from "../../services/api";

const CompleteWorkoutModal = ({ workout, onClose, onCompleted }) => {
  const [feedback, setFeedback] = useState("");
  const [completionNote, setCompletionNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.patch(`/coach/workout/${workout._id}/complete`, {
        feedback,
        completionNote,
      });

      onCompleted?.(response.data?.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to mark workout complete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className='fixed inset-0 z-60 bg-black/60'
        onClick={onClose}
        aria-hidden='true'
      />
      <div className='fixed inset-x-4 top-1/2 z-70 mx-auto max-w-xl -translate-y-1/2 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/60'>
        <h3 className='text-lg font-semibold text-white'>Complete Workout</h3>
        <p className='text-sm text-slate-400'>
          Let your coach know how the session went.
        </p>

        <textarea
          className='mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-emerald-500'
          placeholder='Feedback for coach...'
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />

        <textarea
          className='mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-amber-500'
          placeholder='Completion notes...'
          value={completionNote}
          onChange={(e) => setCompletionNote(e.target.value)}
          rows={3}
        />

        {error && (
          <p className='mt-2 text-xs text-red-400'>
            {error}
          </p>
        )}

        <div className='mt-5 flex justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white'>
            Cancel
          </button>
          <button
            type='button'
            onClick={handleComplete}
            disabled={loading}
            className='rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition disabled:opacity-60'>
            {loading ? "Submitting..." : "Mark Complete"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CompleteWorkoutModal;
