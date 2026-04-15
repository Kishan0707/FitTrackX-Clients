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
      icon: "\u{1F4AA}",
      desc: "Build strength & size",
    },
    {
      value: "fat loss",
      label: "Fat Loss",
      icon: "\u{1F525}",
      desc: "Burn fat & get lean",
    },
    {
      value: "strength",
      label: "Strength",
      icon: "\u{1F3CB}\uFE0F",
      desc: "Maximize power",
    },
  ];

  const experienceOptions = [
    {
      value: "beginner",
      label: "Beginner",
      icon: "\u{1F331}",
      desc: "New to fitness",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      icon: "\u26A1",
      desc: "Some experience",
    },
    {
      value: "expert",
      label: "Expert",
      icon: "\u{1F451}",
      desc: "Advanced level",
    },
  ];

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900'>
        {/* Header Section */}
        <div className='text-center py-12 px-4'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4'>
              AI Workout Generator
            </h1>
            <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
              Get personalized workout plans powered by artificial intelligence.
              Choose your goals and experience level for the perfect fitness
              routine.
            </p>
          </div>
        </div>

        {/* Notification Messages */}
        {error && (
          <div className='max-w-4xl mx-auto mb-6 px-4'>
            <div className='bg-linear-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg animate-bounce border border-red-400'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>{"\u26A0\uFE0F"}</span>
                <span className='font-semibold'>{error}</span>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className='max-w-4xl mx-auto mb-6 px-4'>
            <div className='bg-linear-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg animate-pulse border border-green-400'>
              <div className='flex items-center'>
                <span className='text-2xl mr-3'>{"\u{1F389}"}</span>
                <span className='font-semibold'>{success}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className='max-w-4xl mx-auto px-4 mb-12'>
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20'>
            <h2 className='text-3xl font-bold text-white mb-8 text-center'>
              Customize Your Plan
            </h2>

            <div className='grid md:grid-cols-2 gap-8 mb-8'>
              {/* Goal Selection */}
              <div>
                <label className='block text-lg font-semibold text-white mb-4'>
                  {"\u{1F3AF}"} Your Goal
                </label>
                <div className='space-y-3'>
                  {goalOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setGoal(option.value)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        goal === option.value ?
                          "bg-linear-to-r from-purple-500 to-pink-500 shadow-lg ring-2 ring-purple-300"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}>
                      <div className='flex items-center'>
                        <span className='text-2xl mr-3'>{option.icon}</span>
                        <div>
                          <div
                            className={`font-semibold ${
                              goal === option.value ?
                                "text-white"
                              : "text-gray-300"
                            }`}>
                            {option.label}
                          </div>
                          <div
                            className={`text-sm ${
                              goal === option.value ?
                                "text-purple-100"
                              : "text-gray-400"
                            }`}>
                            {option.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Selection */}
              <div>
                <label className='block text-lg font-semibold text-white mb-4'>
                  {"\u{1F4CA}"} Experience Level
                </label>
                <div className='space-y-3'>
                  {experienceOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setExperience(option.value)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        experience === option.value ?
                          "bg-linear-to-r from-blue-500 to-purple-500 shadow-lg ring-2 ring-blue-300"
                        : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}>
                      <div className='flex items-center'>
                        <span className='text-2xl mr-3'>{option.icon}</span>
                        <div>
                          <div
                            className={`font-semibold ${
                              experience === option.value ?
                                "text-white"
                              : "text-gray-300"
                            }`}>
                            {option.label}
                          </div>
                          <div
                            className={`text-sm ${
                              experience === option.value ?
                                "text-blue-100"
                              : "text-gray-400"
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

            {/* Generate Button */}
            <div className='text-center'>
              <button
                onClick={generateWorkout}
                disabled={loading || !goal || !experience}
                className={`px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 transform ${
                  loading || !goal || !experience ?
                    "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-linear-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105 text-white"
                }`}>
                {loading ?
                  <div className='flex items-center justify-center'>
                    <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3'></div>
                    Generating Your Plan...
                  </div>
                : <div className='flex items-center justify-center'>
                    <span className='mr-2'>{"\u{1F680}"}</span>
                    Generate Workout Plan
                  </div>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Workout Plan Display */}
        {plan.length > 0 && (
          <div className='max-w-7xl mx-auto px-4 pb-12'>
            <div className='text-center mb-12'>
              <h2 className='text-4xl font-bold text-white mb-4'>
                Your Personalized Workout Plan
              </h2>
              <p className='text-xl text-gray-300'>
                Follow this AI-generated plan to achieve your fitness goals!{" "}
                {"\u{1F4AA}"}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {plan.map((day, index) => (
                <div
                  key={day?._id || index}
                  className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl'>
                  {/* Day Header */}
                  <div className='flex items-center mb-4'>
                    <div className='w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4'>
                      {day.day || String(index + 1)}
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-white'>
                        {day.workout || day.title}
                      </h3>
                      <p className='text-gray-400 text-sm'>
                        Day {day.day || String(index + 1)} Workout
                      </p>
                    </div>
                  </div>

                  {/* Workout Image */}
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
                      <h4 className='text-lg font-semibold text-white mb-3 flex items-center'>
                        <span className='mr-2'>{"\u{1F3CB}\uFE0F"}</span>
                        Exercises
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
                              className={`bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors duration-200 ${
                                isCompletedExercise ? "bg-green-500/20" : (
                                  " hover:bg-white/10"
                                )
                              }`}>
                              <div className='flex justify-between items-center'>
                                <span className='text-gray-200 font-medium truncate'>
                                  {exerciseName}
                                </span>
                                <span className='text-purple-300 font-semibold text-sm bg-purple-500/20 px-2 py-1 rounded-full truncate'>
                                  {exercise.sets || 3} x {exercise.reps || 10}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Rest Day */}
                  {(!day.exercises || day.exercises.length === 0) && (
                    <div className='text-center py-8'>
                      <span className='text-4xl mb-2 block'>{"\u{1F634}"}</span>
                      <p className='text-gray-400 font-medium'>Rest Day</p>
                      <p className='text-gray-500 text-sm'>
                        Take it easy, recover well!
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedExercise && (
          <div className='fixed inset-0 bg-black/70 flex justify-center items-center z-50'>
            <div className='bg-white rounded-xl p-6 w-[400px] relative'>
              <button
                onClick={() => setSelectedExercise(null)}
                className='absolute top-2 right-2 text-red-500'>
                ✖
              </button>

              <h2 className='text-xl font-bold mb-4'>
                {selectedExercise.name}
              </h2>

              {/* 🎥 VIDEO */}
              <video controls className='w-full mb-4 rounded'>
                <source src={selectedExercise.video || "/demo.mp4"} />
              </video>

              {/* 🔥 SET LIST */}
              <div className='space-y-2 mb-4'>
                {[...Array(selectedExercise.sets || 3)].map((_, i) => {
                  const key = `${selectedExercise.exerciseId}-set-${i}`;
                  const inputId = `set-${i}`;
                  return (
                    <div
                      key={i}
                      className='flex justify-between items-center bg-gray-100 p-2 rounded hover:bg-slate-500'>
                      <label className='text-slate-800' htmlFor={inputId}>
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

              {/* REPS */}
              <p className='mb-4 text-black'>
                Reps: {selectedExercise.reps || 10}
              </p>

              {/* COMPLETE BUTTON */}
              <button
                onClick={() => handleComplete(selectedExercise)}
                className='bg-green-500 text-white px-4 py-2 rounded w-full'>
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
