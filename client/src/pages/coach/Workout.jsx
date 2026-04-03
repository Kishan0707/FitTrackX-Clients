import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  FaBolt,
  FaDumbbell,
  FaEdit,
  FaFire,
  FaPlus,
  FaTrash,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

const exerciseOptions = [
  "Push Ups",
  "Pull Ups",
  "Squats",
  "Lunges",
  "Plank",
  "Burpees",
  "Bench Press",
  "Deadlift",
  "Bicep Curls",
  "Tricep Dips",
  "Shoulder Press",
  "Leg Press",
  "Running",
  "Cycling",
  "Swimming",
];

const initialFormData = {
  userId: "",
  type: "",
  title: "",
  caloriesBurned: "",
  duration: "",
  exercises: [],
};

const initialExercise = {
  name: "",
  sets: "",
  reps: "",
  weight: "",
  duration: "",
};

const Workout = () => {
  const [clients, setClients] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedClientFilter, setSelectedClientFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState(initialFormData);
  const [exercise, setExercise] = useState(initialExercise);

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = (nextClients = clients) => {
    setEditingWorkoutId("");
    setFormData({
      ...initialFormData,
      userId: nextClients[0]?._id || "",
    });
    setExercise(initialExercise);
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const [clientsRes, workoutsRes] = await Promise.all([
        API.get("/coach/clients"),
        API.get("/workouts?limit=100"),
      ]);

      const clientsData = clientsRes.data?.data || [];
      const workoutsData = workoutsRes.data?.data || [];

      setClients(clientsData);
      setWorkouts(workoutsData);
      setError("");
      if (!editingWorkoutId) {
        setFormData((prev) => ({
          ...prev,
          userId:
            prev.userId ||
            (clientsData.length > 0 ?
              clientsData[0]._id
            : initialFormData.userId),
        }));
      }
    } catch (err) {
      console.error(err);
      showMessage("Failed to load workouts.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startEditingWorkout = (workout) => {
    setEditingWorkoutId(workout._id);
    setFormData({
      userId: workout.userId?._id || workout.userId || "",
      type: workout.type || "",
      title: workout.title || "",
      caloriesBurned: String(workout.caloriesBurned || ""),
      duration: String(workout.duration || ""),
      exercises: Array.isArray(workout.exercises) ? [...workout.exercises] : [],
    });
    setExercise(initialExercise);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addExercise = () => {
    if (!exercise.name || !exercise.sets || !exercise.reps) {
      showMessage("Exercise name, sets and reps are required.", "error");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name: exercise.name,
          sets: Number(exercise.sets),
          reps: Number(exercise.reps),
          ...(exercise.weight ? { weight: Number(exercise.weight) } : {}),
          ...(exercise.duration ? { duration: Number(exercise.duration) } : {}),
        },
      ],
    }));
    setExercise(initialExercise);
  };

  const removeExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.userId || !formData.type || !formData.duration) {
      showMessage("Client, type and duration are required.", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        caloriesBurned: Number(formData.caloriesBurned) || 0,
        duration: Number(formData.duration) || 0,
      };

      if (editingWorkoutId) {
        await API.put(`/workouts/${editingWorkoutId}`, payload);
        showMessage("Workout updated successfully.");
      } else {
        await API.post("/workouts", payload);
        showMessage("Workout assigned successfully.");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message ||
          (editingWorkoutId ?
            "Failed to update workout."
          : "Failed to create workout."),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkout = async (workoutId) => {
    try {
      setDeletingId(workoutId);
      await API.delete(`/workouts/${workoutId}`);
      setWorkouts((prev) =>
        prev.filter((workout) => workout._id !== workoutId),
      );
      showMessage("Workout deleted successfully.");
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.message || "Failed to delete workout.",
        "error",
      );
    } finally {
      setDeletingId("");
    }
  };

  const filteredWorkouts = useMemo(
    () =>
      workouts.filter((workout) => {
        const workoutUserId = workout.userId?._id || workout.userId;
        const clientMatch =
          selectedClientFilter === "all" ||
          workoutUserId === selectedClientFilter;
        const typeMatch = typeFilter === "all" || workout.type === typeFilter;
        return clientMatch && typeMatch;
      }),
    [selectedClientFilter, typeFilter, workouts],
  );

  const totalCalories = filteredWorkouts.reduce(
    (sum, workout) => sum + (Number(workout.caloriesBurned) || 0),
    0,
  );
  const totalDuration = filteredWorkouts.reduce(
    (sum, workout) => sum + (Number(workout.duration) || 0),
    0,
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Workout Management</h1>
          <p className='mt-1 text-sm text-slate-400'>
            Clients ke liye workouts assign karo aur apne created workout
            library ko manage karo.
          </p>
        </div>

        {error && (
          <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200'>
            {error}
          </div>
        )}
        {success && (
          <div className='rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-green-200'>
            {success}
          </div>
        )}

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <div className='flex items-center gap-3'>
              <FaDumbbell className='text-blue-400' />
              <div>
                <p className='text-sm text-slate-400'>Filtered Workouts</p>
                <p className='text-3xl font-bold text-white'>
                  {filteredWorkouts.length}
                </p>
              </div>
            </div>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <div className='flex items-center gap-3'>
              <FaFire className='text-orange-400' />
              <div>
                <p className='text-sm text-slate-400'>Total Calories</p>
                <p className='text-3xl font-bold text-white'>
                  {totalCalories.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className='rounded-xl border border-slate-700 bg-slate-900 p-5'>
            <div className='flex items-center gap-3'>
              <FaUsers className='text-emerald-400' />
              <div>
                <p className='text-sm text-slate-400'>Active Clients</p>
                <p className='text-3xl font-bold text-white'>
                  {clients.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-slate-700 bg-slate-900 p-6'>
          <div className='mb-5 flex items-center gap-2'>
            {editingWorkoutId ?
              <FaEdit className='text-amber-400' />
            : <FaPlus className='text-blue-400' />}
            <h2 className='text-lg font-semibold text-white'>
              {editingWorkoutId ? "Edit Workout" : "Assign Workout"}
            </h2>
          </div>

          {clients.length === 0 ?
            <p className='text-sm text-slate-400'>
              Abhi tak clients available nahi hain.
            </p>
          : <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <select
                  value={formData.userId}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      userId: event.target.value,
                    }))
                  }
                  className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'>
                  <option value=''>Select client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.type}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: event.target.value,
                    }))
                  }
                  className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'>
                  <option value=''>Workout type</option>
                  <option value='cardio'>Cardio</option>
                  <option value='strength'>Strength</option>
                  <option value='flexibility'>Flexibility</option>
                  <option value='balance'>Balance</option>
                  <option value='gym'>Gym</option>
                  <option value='home'>Home</option>
                  <option value='run'>Run</option>
                  <option value='boxing'>Boxing</option>
                </select>

                <input
                  type='text'
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder='Workout title'
                  className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                />

                <input
                  type='number'
                  min='1'
                  value={formData.duration}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: event.target.value,
                    }))
                  }
                  placeholder='Duration (minutes)'
                  className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                />
              </div>

              <div className='grid gap-4 md:grid-cols-3'>
                <input
                  type='number'
                  min='0'
                  value={formData.caloriesBurned}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      caloriesBurned: event.target.value,
                    }))
                  }
                  placeholder='Calories burn'
                  className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'
                />
              </div>

              <div className='rounded-xl border border-slate-700 bg-slate-950/60 p-5'>
                <div className='mb-4 flex items-center gap-2'>
                  <FaBolt className='text-yellow-400' />
                  <h3 className='text-sm font-semibold text-white'>
                    Exercise Builder
                  </h3>
                </div>
                <div className='grid gap-3 md:grid-cols-5'>
                  <select
                    value={exercise.name}
                    onChange={(event) =>
                      setExercise((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className='rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-blue-500 md:col-span-2'>
                    <option value=''>Choose exercise</option>
                    {exerciseOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <input
                    type='number'
                    min='1'
                    value={exercise.sets}
                    onChange={(event) =>
                      setExercise((prev) => ({
                        ...prev,
                        sets: event.target.value,
                      }))
                    }
                    placeholder='Sets'
                    className='rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='1'
                    value={exercise.reps}
                    onChange={(event) =>
                      setExercise((prev) => ({
                        ...prev,
                        reps: event.target.value,
                      }))
                    }
                    placeholder='Reps'
                    className='rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='0'
                    value={exercise.weight}
                    onChange={(event) =>
                      setExercise((prev) => ({
                        ...prev,
                        weight: event.target.value,
                      }))
                    }
                    placeholder='Weight'
                    className='rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <input
                    type='number'
                    min='0'
                    value={exercise.duration}
                    onChange={(event) =>
                      setExercise((prev) => ({
                        ...prev,
                        duration: event.target.value,
                      }))
                    }
                    placeholder='Exercise duration'
                    className='rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-blue-500'
                  />
                  <button
                    type='button'
                    onClick={addExercise}
                    className='rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 md:col-span-2'>
                    Add Exercise
                  </button>
                </div>

                {(formData.exercises || []).length > 0 && (
                  <div className='mt-4 grid gap-3 md:grid-cols-2'>
                    {formData.exercises.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className='flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3'>
                        <div>
                          <p className='text-sm font-medium text-white'>
                            {item.name}
                          </p>
                          <p className='mt-1 text-xs text-slate-400'>
                            {item.sets} sets x {item.reps} reps
                          </p>
                        </div>
                        <button
                          type='button'
                          onClick={() => removeExercise(index)}
                          className='text-sm text-red-300 transition-colors hover:text-red-200'>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='flex flex-wrap gap-3'>
                <button
                  type='submit'
                  disabled={saving}
                  className={`rounded-lg px-5 py-3 text-sm font-medium transition-colors ${
                    saving ?
                      "cursor-not-allowed bg-slate-700 text-slate-400"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                  {saving ?
                    "Saving..."
                  : editingWorkoutId ?
                    "Update Workout"
                  : "Assign Workout"}
                </button>
                {editingWorkoutId && (
                  <button
                    type='button'
                    onClick={() => resetForm()}
                    className='inline-flex items-center gap-2 rounded-lg border border-slate-600 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800'>
                    <FaTimes /> Cancel Edit
                  </button>
                )}
              </div>
            </form>
          }
        </div>

        <div className='rounded-xl border border-slate-700 bg-slate-900 p-6'>
          <div className='mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <h2 className='text-lg font-semibold text-white'>
              Workout Library
            </h2>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <select
                value={selectedClientFilter}
                onChange={(event) =>
                  setSelectedClientFilter(event.target.value)
                }
                className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'>
                <option value='all'>All clients</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className='rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500'>
                <option value='all'>All types</option>
                <option value='cardio'>Cardio</option>
                <option value='strength'>Strength</option>
                <option value='flexibility'>Flexibility</option>
                <option value='balance'>Balance</option>
                <option value='gym'>Gym</option>
                <option value='home'>Home</option>
                <option value='run'>Run</option>
                <option value='boxing'>Boxing</option>
              </select>
            </div>
          </div>

          {filteredWorkouts.length === 0 ?
            <div className='rounded-lg border border-slate-700 bg-slate-950/40 p-8 text-center'>
              <p className='text-white font-medium'>No workouts found</p>
              <p className='mt-2 text-sm text-slate-400'>
                Filter change karo ya naya workout assign karo.
              </p>
            </div>
          : <div className='grid gap-4 xl:grid-cols-2'>
              {filteredWorkouts.map((workout) => {
                const workoutUser =
                  typeof workout.userId === "object" ? workout.userId : null;

                return (
                  <div
                    key={workout._id}
                    className='rounded-xl border border-slate-700 bg-slate-950/50 p-5'>
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <span className='rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-300'>
                          {workout.type}
                        </span>
                        <h3 className='mt-3 text-lg font-semibold text-white'>
                          {workout.title}
                        </h3>
                        <p className='mt-1 text-sm text-slate-400'>
                          Client: {workoutUser?.name || "Assigned client"}
                          {workoutUser?.email ? ` (${workoutUser.email})` : ""}
                        </p>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        <button
                          onClick={() => startEditingWorkout(workout)}
                          className='inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/20'>
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => deleteWorkout(workout._id)}
                          disabled={deletingId === workout._id}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            deletingId === workout._id ?
                              "cursor-not-allowed bg-slate-700 text-slate-400"
                            : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          }`}>
                          <FaTrash />
                          {deletingId === workout._id ?
                            "Deleting..."
                          : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div className='mt-4 grid gap-3 sm:grid-cols-3'>
                      <div className='rounded-lg border border-slate-700 bg-slate-900 p-3'>
                        <p className='text-xs text-slate-500'>Duration</p>
                        <p className='mt-1 text-lg font-semibold text-white'>
                          {Number(workout.duration || 0)} min
                        </p>
                      </div>
                      <div className='rounded-lg border border-slate-700 bg-slate-900 p-3'>
                        <p className='text-xs text-slate-500'>Calories</p>
                        <p className='mt-1 text-lg font-semibold text-white'>
                          {Number(workout.caloriesBurned || 0)}
                        </p>
                      </div>
                      <div className='rounded-lg border border-slate-700 bg-slate-900 p-3'>
                        <p className='text-xs text-slate-500'>Created</p>
                        <p className='mt-1 text-lg font-semibold text-white'>
                          {new Date(workout.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <p className='text-sm font-medium text-slate-300'>
                        Exercises
                      </p>
                      {workout.exercises?.length > 0 ?
                        <div className='mt-3 space-y-2'>
                          {workout.exercises.map((item, index) => (
                            <div
                              key={`${item.name}-${index}`}
                              className='rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300'>
                              <span className='font-medium text-white'>
                                {item.name}
                              </span>{" "}
                              - {item.sets} sets x {item.reps} reps
                            </div>
                          ))}
                        </div>
                      : <p className='mt-2 text-sm text-slate-500'>
                          No exercise breakdown added.
                        </p>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          }

          <p className='mt-5 text-xs text-slate-500'>
            Filtered total duration: {totalDuration} minutes
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Workout;
