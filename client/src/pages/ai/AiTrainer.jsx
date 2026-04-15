import { useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

const AiTrainer = () => {
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [plan, setPlan] = useState([]);
  const [planId, setPlanId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completed, setCompleted] = useState({});

  const generateWorkout = async () => {
    try {
      setLoading(true);
      const res = await API.post("/ai/ai-workout", { goal, experience });

      const days = res?.data?.data?.days ?? res?.data?.data;
      const nextPlanId = res?.data?.data?.planId || "";

      if (!Array.isArray(days) || days.length === 0) {
        setError("No plan generated");
        return;
      }

      setPlan(days);
      setPlanId(nextPlanId);
      setSuccess(
        res?.data?.saved ?
          "Workout plan generated and saved successfully!"
        : "Workout plan generated successfully!",
      );
      setTimeout(() => setSuccess(""), 3000);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Server is not working",
      );
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (exercise) => {
    try {
      if (!exercise?.planId || !exercise?.dayId || !exercise?.exerciseId) {
        setError(
          "Generate the plan while logged in to save it before completing exercises.",
        );
        return;
      }

      const payload = {
        planId: exercise.planId,
        dayId: exercise.dayId,
        exerciseId: exercise.exerciseId,
      };

      await API.post("/ai/complete-exercise", payload);

      setCompleted((prev) => ({ ...prev, [exercise.name]: true }));

      setPlan((prev) =>
        prev.map((day) => {
          if (String(day?._id) !== String(exercise.dayId)) return day;

          const nextExercises =
            Array.isArray(day.exercises) ?
              day.exercises.map((ex) =>
                String(ex?._id) === String(exercise.exerciseId) ?
                  { ...ex, isCompleted: true }
                : ex,
              )
            : day.exercises;

          return { ...day, exercises: nextExercises };
        }),
      );

      setSelectedExercise(null);
      setSuccess("Workout completed successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Workout not completed, something went wrong");
      setTimeout(() => setError(""), 3000);
    }
  };

  const goalOptions = [
    {
      value: "muscle gain",
      label: "Muscle Gain",
      icon: "💪",
      desc: "Build strength & size",
    },
    {
      value: "fat loss",
      label: "Fat Loss",
      icon: "🔥",
      desc: "Burn fat & get lean",
    },
    {
      value: "strength",
      label: "Strength",
      icon: "🏋️",
      desc: "Maximize power",
    },
  ];

  const experienceOptions = [
    {
      value: "beginner",
      label: "Beginner",
      icon: "🌱",
      desc: "New to fitness",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      icon: "⚡",
      desc: "Some experience",
    },
    { value: "expert", label: "Expert", icon: "👑", desc: "Advanced level" },
  ];

  return (
    <DashboardLayout>
      {/* ─── Page wrapper ─── */}
      <div className='min-h-screen bg-green-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300'>
        {/* ─── Header ─── */}
        <div className='text-center py-12 px-4'>
          <div className='max-w-4xl mx-auto'>
            <h1
              className='text-5xl md:text-6xl font-bold mb-4
              text-transparent bg-clip-text
              bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500
              dark:from-purple-400 dark:via-pink-400 dark:to-red-400'>
              AI Workout Generator
            </h1>
            <p className='text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300'>
              Get personalized workout plans powered by artificial intelligence.
              Choose your goals and experience level for the perfect fitness
              routine.
            </p>
          </div>
        </div>

        {/* ─── Error / Success toasts ─── */}
        {error && (
          <div className='max-w-4xl mx-auto mb-6 px-4'>
            <div className='bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg animate-bounce border border-red-400 flex items-center'>
              <span className='text-2xl mr-3'>⚠️</span>
              <span className='font-semibold'>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className='max-w-4xl mx-auto mb-6 px-4'>
            <div className='bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg animate-pulse border border-green-400 flex items-center'>
              <span className='text-2xl mr-3'>🎉</span>
              <span className='font-semibold'>{success}</span>
            </div>
          </div>
        )}

        {/* ─── Form card ─── */}
        <div className='max-w-4xl mx-auto px-4 mb-12'>
          <div
            className='
            bg-white border border-green-100 shadow-lg
            dark:bg-white/10 dark:backdrop-blur-lg dark:border-white/20 dark:shadow-2xl
            rounded-2xl p-8 transition-colors duration-300'>
            <h2 className='text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white'>
              Customize Your Plan
            </h2>

            <div className='grid md:grid-cols-2 gap-8 mb-8'>
              {/* Goal selection */}
              <div>
                <label className='block text-lg font-semibold mb-4 text-gray-700 dark:text-white'>
                  🎯 Your Goal
                </label>
                <div className='space-y-3'>
                  {goalOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setGoal(option.value)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        goal === option.value ?
                          "bg-gradient-to-r from-green-500 to-emerald-500 dark:from-purple-500 dark:to-pink-500 shadow-lg ring-2 ring-green-300 dark:ring-purple-300"
                        : "bg-green-50 hover:bg-green-100 border border-green-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10"
                      }`}>
                      <div className='flex items-center'>
                        <span className='text-2xl mr-3'>{option.icon}</span>
                        <div>
                          <div
                            className={`font-semibold ${
                              goal === option.value ?
                                "text-white"
                              : "text-gray-700 dark:text-gray-300"
                            }`}>
                            {option.label}
                          </div>
                          <div
                            className={`text-sm ${
                              goal === option.value ?
                                "text-green-100 dark:text-purple-100"
                              : "text-gray-500 dark:text-gray-400"
                            }`}>
                            {option.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience selection */}
              <div>
                <label className='block text-lg font-semibold mb-4 text-gray-700 dark:text-white'>
                  📊 Experience Level
                </label>
                <div className='space-y-3'>
                  {experienceOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setExperience(option.value)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        experience === option.value ?
                          "bg-gradient-to-r from-teal-500 to-green-500 dark:from-blue-500 dark:to-purple-500 shadow-lg ring-2 ring-teal-300 dark:ring-blue-300"
                        : "bg-green-50 hover:bg-green-100 border border-green-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10"
                      }`}>
                      <div className='flex items-center'>
                        <span className='text-2xl mr-3'>{option.icon}</span>
                        <div>
                          <div
                            className={`font-semibold ${
                              experience === option.value ?
                                "text-white"
                              : "text-gray-700 dark:text-gray-300"
                            }`}>
                            {option.label}
                          </div>
                          <div
                            className={`text-sm ${
                              experience === option.value ?
                                "text-teal-100 dark:text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                            }`}>
                            {option.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate button */}
            <div className='text-center'>
              <button
                onClick={generateWorkout}
                disabled={loading || !goal || !experience}
                className={`px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 transform ${
                  loading || !goal || !experience ?
                    "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50 text-gray-500 dark:text-gray-400"
                  : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 dark:from-purple-500 dark:via-pink-500 dark:to-red-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 dark:hover:from-purple-600 dark:hover:via-pink-600 dark:hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105 text-white"
                }`}>
                {loading ?
                  <div className='flex items-center justify-center'>
                    <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3'></div>
                    Generating Your Plan...
                  </div>
                : <div className='flex items-center justify-center'>
                    <span className='mr-2'>🚀</span>
                    Generate Workout Plan
                  </div>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ─── Workout plan grid ─── */}
        {plan.length > 0 && (
          <div className='max-w-7xl mx-auto px-4 pb-12'>
            <div className='text-center mb-12'>
              <h2 className='text-4xl font-bold mb-4 text-gray-800 dark:text-white'>
                Your Personalized Workout Plan
              </h2>
              <p className='text-xl text-gray-600 dark:text-gray-300'>
                Follow this AI-generated plan to achieve your fitness goals! 💪
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {plan.map((day, index) => (
                <div
                  key={day?._id || index}
                  className='
                    bg-white border border-green-100 shadow-md
                    dark:bg-white/10 dark:backdrop-blur-lg dark:border-white/20 dark:shadow-xl
                    rounded-2xl p-6
                    hover:shadow-xl dark:hover:bg-white/15
                    transition-all duration-300 transform hover:scale-105'>
                  {/* Day header */}
                  <div className='flex items-center mb-4'>
                    <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-purple-500 dark:to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4'>
                      {day.day || String(index + 1)}
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-800 dark:text-white'>
                        {day.workout || day.title}
                      </h3>
                      <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        Day {day.day || String(index + 1)} Workout
                      </p>
                    </div>
                  </div>

                  {/* Workout image */}
                  {day.image && (
                    <div className='mb-4'>
                      <img
                        src={day.image}
                        alt={day.workout}
                        className='w-full h-32 object-cover rounded-xl shadow-lg'
                      />
                    </div>
                  )}

                  {/* Exercises */}
                  {day.exercises && day.exercises.length > 0 && (
                    <div>
                      <h4 className='text-lg font-semibold mb-3 flex items-center text-gray-700 dark:text-white'>
                        <span className='mr-2'>🏋️</span> Exercises
                      </h4>
                      <div className='space-y-2'>
                        {day.exercises.map((exercise, exIndex) => {
                          const exerciseName = exercise?.name || exercise;
                          const isCompletedExercise =
                            Boolean(exercise?.isCompleted) ||
                            Boolean(completed?.[exerciseName]);

                          const exWithWorkout = {
                            ...exercise,
                            planId,
                            dayId: day._id,
                            exerciseId: exercise._id,
                            name: exerciseName,
                          };

                          return (
                            <div
                              key={exIndex}
                              onClick={() => setSelectedExercise(exWithWorkout)}
                              className={`rounded-lg p-3 border transition-colors duration-200 cursor-pointer ${
                                isCompletedExercise ?
                                  "bg-green-100 border-green-300 dark:bg-green-500/20 dark:border-green-500/30"
                                : "bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-200 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
                              }`}>
                              <div className='flex justify-between items-center p-1 rounded'>
                                <span className='font-medium truncate text-gray-700 dark:text-gray-200'>
                                  {exerciseName}{" "}
                                  {isCompletedExercise ? "✅" : ""}
                                </span>
                                <span
                                  className='font-semibold text-sm px-2 py-1 rounded-full truncate ml-2
                                  text-green-700 bg-green-100
                                  dark:text-purple-300 dark:bg-purple-500/20'>
                                  {exercise.sets || 3} x {exercise.reps || 10}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Rest day */}
                  {(!day.exercises || day.exercises.length === 0) && (
                    <div className='text-center py-8'>
                      <span className='text-4xl mb-2 block'>😴</span>
                      <p className='font-medium text-gray-500 dark:text-gray-400'>
                        Rest Day
                      </p>
                      <p className='text-sm text-gray-400 dark:text-gray-500'>
                        Take it easy, recover well!
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Exercise modal ─── */}
        {selectedExercise && (
          <div className='fixed inset-0 bg-black/70 flex justify-center items-center z-50'>
            <div
              className='
              bg-white text-gray-800
              dark:bg-slate-800 dark:text-white
              rounded-xl p-6 w-[400px] relative shadow-2xl
              transition-colors duration-300'>
              <button
                onClick={() => setSelectedExercise(null)}
                className='absolute top-2 right-2 text-red-500 hover:text-red-600 font-bold text-lg'>
                ✖
              </button>

              <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-white'>
                {selectedExercise.name}
              </h2>

              {/* Video */}
              <video controls className='w-full mb-4 rounded'>
                <source src={selectedExercise.video || "/demo.mp4"} />
              </video>

              {/* Set list */}
              <div className='space-y-2 mb-4'>
                {[...Array(selectedExercise.sets || 3)].map((_, i) => {
                  const key = `${selectedExercise.exerciseId}-set-${i}`;
                  const inputId = `set-${i}`;
                  return (
                    <div
                      key={i}
                      className='flex justify-between items-center p-2 rounded
                        bg-gray-50 border border-gray-200
                        dark:bg-white/5 dark:border-white/10
                        hover:bg-green-50 dark:hover:bg-white/10
                        transition-colors duration-200'>
                      <label
                        className='font-medium text-gray-700 dark:text-gray-200'
                        htmlFor={inputId}>
                        Set {i + 1}
                      </label>
                      <input
                        type='checkbox'
                        id={inputId}
                        checked={completed[key] || false}
                        onChange={() => {
                          setCompleted((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }));
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Reps */}
              <p className='mb-4 text-gray-700 dark:text-gray-200'>
                Reps: {selectedExercise.reps || 10}
              </p>

              {/* Complete button */}
              <button
                onClick={() => handleComplete(selectedExercise)}
                className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full font-semibold transition-colors duration-200'>
                Mark Exercise Done ✔
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AiTrainer;
