import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import Workouts from "./Workouts";

const AddWorkout = () => {
  const [formData, setFormData] = useState({
    userId: "",
    type: "",
    caloriesBurned: "",
    duration: "",
    exercises: [],
  });
  const [workouts, setWorkouts] = useState([]);

  const [clients, setClients] = useState([]);
  const [exercise, setExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    weight: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await API.get("/coach/clients");
        setClients(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleExerciseChange = (e) =>
    setExercise({ ...exercise, [e.target.name]: e.target.value });

  const addExercise = () => {
    if (exercise.name && exercise.sets && exercise.reps) {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, exercise],
      });
      setExercise({ name: "", sets: "", reps: "", weight: "", duration: "" });
    }
  };

  const removeExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting workout with data:", formData);
      const response = await API.post("/workouts", formData);
      console.log("Create response:", response.data);
      setSuccess(response.data.message);

      // Refetch all workouts after creating a new one to ensure state is in sync with backend
      try {
        console.log("Refetching workouts...");
        const workoutsRes = await API.get("/workouts");
        console.log("Refetch response:", workoutsRes.data);
        if (workoutsRes.data && workoutsRes.data.data) {
          console.log(
            "Setting workouts:",
            workoutsRes.data.data.map((w) => ({ _id: w._id, type: w.type })),
          );
          setWorkouts(workoutsRes.data.data);
        }
      } catch (fetchError) {
        console.error("Failed to refetch workouts:", fetchError);
        // Still add the new one to local state even if refetch fails
        setWorkouts([...workouts, response.data.data]);
      }

      setFormData({
        userId: "",
        type: "",
        caloriesBurned: "",
        duration: "",
        exercises: [],
      });

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error creating workout:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Error adding workout",
      );
    }
  };

  return (
    <>
      <DashboardLayout>
        {/* Notifications */}
        {error && (
          <div className='fixed top-20 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-red-400/50 backdrop-blur-lg z-50 animate-pulse'>
            <div className='flex items-center gap-3'>
              <span className='text-xl'>⚠️</span>
              <span className='font-semibold'>{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className='fixed top-20 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-400/50 backdrop-blur-lg z-50 animate-bounce'>
            <div className='flex items-center gap-3'>
              <span className='text-xl'>✅</span>
              <span className='font-semibold'>{success}</span>
            </div>
          </div>
        )}

        <div className='p-6 max-w-4xl mx-auto'>
          {/* Form Container */}
          <div className='bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden'>
            {/* Header */}
            <div className='bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center'>
              <h1 className='text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3'>
                <span className='md:text-5xl text-4xl'>💪</span>
                Create Workout
              </h1>
              <p className='text-purple-100 text-sm'>
                Assign a complete workout to your client
              </p>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className='p-8'>
              {/* Client Selection */}
              <div className='mb-8'>
                <label className='block text-white font-bold mb-3 text-lg'>
                  <span className='inline-block bg-purple-500 text-white rounded-full w-8 h-8 text-center leading-8 mr-2 text-sm'>
                    1
                  </span>
                  Select Client
                </label>
                <select
                  name='userId'
                  value={formData.userId}
                  onChange={handleChange}
                  className='w-full bg-slate-800 border-2 border-slate-600 hover:border-purple-500 focus:border-purple-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                  required>
                  <option value=''>Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Workout Details */}
              <div className='mb-8'>
                <label className='block text-white font-bold mb-4 text-lg'>
                  <span className='inline-block bg-purple-500 text-white rounded-full w-8 h-8 text-center leading-8 mr-2 text-sm'>
                    2
                  </span>
                  Workout Details
                </label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='text-purple-300 text-sm font-semibold mb-2 block'>
                      Workout Type
                    </label>
                    <select
                      name='type'
                      value={formData.type}
                      onChange={handleChange}
                      className='w-full bg-slate-800 border-2 border-slate-600 hover:border-purple-500 focus:border-purple-500 rounded-xl p-4 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                      required>
                      <option value=''>Select type...</option>
                      <option value='cardio'>🏃 Cardio</option>
                      <option value='strength'>💪 Strength</option>
                      <option value='flexibility'>🧘 Flexibility</option>
                      <option value='balance'>⚖️ Balance</option>
                      <option value='gym'>🏋️ Gym</option>
                      <option value='home'>🏠 Home</option>
                      <option value='run'>🚶 Run</option>
                      <option value='boxing'>👊 Boxing</option>
                    </select>
                  </div>
                  <div>
                    <label className='text-orange-300 text-sm font-semibold mb-2 block'>
                      Calories (kcal)
                    </label>
                    <input
                      type='number'
                      name='caloriesBurned'
                      value={formData.caloriesBurned || ""}
                      onChange={handleChange}
                      placeholder='e.g., 250'
                      className='w-full bg-slate-800 border-2 border-orange-500/30 hover:border-orange-500 focus:border-orange-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50'
                      required
                    />
                  </div>
                  <div>
                    <label className='text-blue-300 text-sm font-semibold mb-2 block'>
                      Duration (minutes)
                    </label>
                    <input
                      type='number'
                      name='duration'
                      value={formData.duration || ""}
                      onChange={handleChange}
                      placeholder='e.g., 30'
                      className='w-full bg-slate-800 border-2 border-blue-500/30 hover:border-blue-500 focus:border-blue-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Exercises Section */}
              <div className='mb-8'>
                <label className='block text-white font-bold mb-4 text-lg'>
                  <span className='inline-block bg-purple-500 text-white rounded-full w-8 h-8 text-center leading-8 mr-2 text-sm'>
                    3
                  </span>
                  Add Exercises
                </label>
                <div className='bg-slate-800/50 border-2 border-slate-700 rounded-xl p-6 space-y-4'>
                  <div>
                    <label className='text-slate-300 text-sm font-semibold mb-2 block'>
                      Exercise Name
                    </label>
                    <select
                      name='name'
                      value={exercise.name}
                      onChange={handleExerciseChange}
                      className='w-full bg-slate-800 border-2 border-slate-600 hover:border-purple-500 focus:border-purple-500 rounded-xl p-4 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'>
                      <option value=''>Choose exercise...</option>
                      {exerciseOptions.map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                    <div>
                      <label className='text-slate-300 text-xs font-semibold mb-2 block'>
                        Sets
                      </label>
                      <input
                        type='number'
                        name='sets'
                        value={exercise.sets || ""}
                        onChange={handleExerciseChange}
                        placeholder='3'
                        className='w-full bg-slate-800 border-2 border-slate-600 hover:border-purple-500 focus:border-purple-500 rounded-lg p-2 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                      />
                    </div>
                    <div>
                      <label className='text-slate-300 text-xs font-semibold mb-2 block'>
                        Reps
                      </label>
                      <input
                        type='number'
                        name='reps'
                        value={exercise.reps || ""}
                        onChange={handleExerciseChange}
                        placeholder='10'
                        className='w-full bg-slate-800 border-2 border-slate-600 hover:border-purple-500 focus:border-purple-500 rounded-lg p-2 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                      />
                    </div>
                    <div>
                      <label className='text-slate-300 text-xs font-semibold mb-2 block'>
                        Weight (kg)
                      </label>
                      <input
                        type='number'
                        name='weight'
                        value={exercise.weight || ""}
                        onChange={handleExerciseChange}
                        placeholder='Optional'
                        className='w-full bg-slate-800 border-2 border-slate-600 hover:border-purple-500 focus:border-purple-500 rounded-lg p-2 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                      />
                    </div>
                    <div>
                      <label className='text-slate-300 text-xs font-semibold mb-2 block'>
                        Duration (min)
                      </label>
                      <input
                        type='number'
                        name='duration'
                        value={exercise.duration || ""}
                        onChange={handleExerciseChange}
                        placeholder='Optional'
                        className='w-full bg-slate-800 border-2 border-slate-600 hover:border-purple-500 focus:border-purple-500 rounded-lg p-2 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                      />
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={addExercise}
                    className='w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105'>
                    + Add Exercise
                  </button>
                </div>

                {/* Exercise List */}
                {formData.exercises.length > 0 && (
                  <div className='mt-6'>
                    <h4 className='text-white font-bold mb-4 text-lg flex items-center gap-2'>
                      <span className='text-xl'>📋</span>
                      Added Exercises ({formData.exercises.length})
                    </h4>
                    <div className='space-y-3'>
                      {formData.exercises.map((ex, index) => (
                        <div
                          key={index}
                          className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/30 p-4 rounded-lg flex justify-between items-center hover:border-purple-500 transition-all duration-300'>
                          <div className='flex-1'>
                            <p className='text-white font-semibold flex items-center gap-2'>
                              <span className='bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded'>
                                {index + 1}
                              </span>
                              {ex.name}
                            </p>
                            <p className='text-purple-200 text-sm mt-1'>
                              {ex.sets} sets × {ex.reps} reps
                              {ex.weight && ` @ ${ex.weight}kg`}
                              {ex.duration && ` • ${ex.duration} min`}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() => removeExercise(index)}
                            className='bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300 ml-4'>
                            ✕ Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-lg'>
                <span>🚀</span>
                Create Workout
              </button>
            </form>

            {/* Info Box */}
            <div className='bg-purple-900/30 border border-purple-500/30 p-6 m-8 rounded-xl backdrop-blur-lg'>
              <p className='text-purple-200 text-sm flex items-start gap-3'>
                <span className='text-xl'>💡</span>
                <span>
                  Add multiple exercises to create a complete workout routine.
                  Your client will see all exercises and can track their
                  progress.
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className='mt-8'>
          <Workouts workouts={workouts} setWorkouts={setWorkouts} />
        </div>
      </DashboardLayout>
    </>
  );
};

export default AddWorkout;
