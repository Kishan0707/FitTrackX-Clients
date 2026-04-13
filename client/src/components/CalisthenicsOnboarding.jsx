import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaChevronRight, FaChevronLeft, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const targetZoneOptions = [
  "Upper body",
  "Core strength",
  "Lower body",
  "Cardio",
  "Mobility",
];
const struggleOptions = ["Consistency", "Time", "Injury", "Nutrition", "Motivation"];
const dietOptions = [
  "Balanced",
  "Keto",
  "Vegan",
  "High protein",
  "Paleo / Low carb",
];
const alcoholOptions = ["None", "Occasionally", "Weekly", "Socially"];
const workoutDurationOptions = ["20 min", "30 min", "45 min", "60+ min"];
const trainingFrequencyOptions = ["1-2x", "3-4x", "5+ times"];
const flexibilityOptions = ["Stiff", "Average", "Flexible"];
const workScheduleOptions = ["Sedentary desk", "Active job", "Shift work", "Flexible schedule"];

const stepDefinitions = [
  {
    title: "Profile basics",
    description:
      "Step away from the dashboard and let us collect the insights that inform your personalized coach match.",
    fields: [
      { name: "name", label: "What's your name?", type: "text", placeholder: "Kishan" },
      {
        name: "gender",
        label: "What is your gender?",
        type: "radio",
        options: ["Male", "Female", "Non-binary", "Prefer not to say"],
      },
      { name: "age", label: "How old are you?", type: "number", placeholder: "27" },
      {
        name: "motivation",
        label: "What's your motivation to get in shape?",
        type: "textarea",
        placeholder: "Feel confident, build strength, keep up with my kids...",
      },
      {
        name: "mainGoal",
        label: "What's your main goal?",
        type: "radio",
        options: [
          "Lose fat",
          "Build muscle",
          "Improve endurance",
          "Master calisthenics",
          "Feel healthier",
        ],
      },
      {
        name: "bodyGoal",
        label: "What is your body goal?",
        type: "text",
        placeholder: "Lean and sculpted, 60 kg, wide shoulders",
      },
    ],
  },
  {
    title: "Experience & readiness",
    description: "Share your training history and the obstacles you have overcome.",
    fields: [
      {
        name: "experience",
        label: "What is your experience with fitness?",
        type: "radio",
        options: ["Beginner", "Intermediate", "Advanced"],
      },
      {
        name: "bestShape",
        label: "How long ago were you in the best shape of your life?",
        type: "radio",
        options: ["Less than 6 months", "6-12 months", "Over a year"],
      },
      {
        name: "calisthenicsKnowledge",
        label: "How familiar are you with calisthenics?",
        type: "radio",
        options: ["New to it", "Tried it", "Practitioner"],
      },
      {
        name: "stumblingBlocks",
        label: "What stopped you from getting fitter before?",
        type: "textarea",
        placeholder: "Time, motivation, injuries, conflicting plans...",
      },
    ],
  },
  {
    title: "Body & performance",
    description: "Drop in the measurements that will become the benchmark for your journey.",
    fields: [
      {
        name: "height",
        label: "What is your height (cm)?",
        type: "number",
        placeholder: "170",
      },
      {
        name: "currentWeight",
        label: "What is your current weight (kg)?",
        type: "number",
        placeholder: "72",
      },
      {
        name: "goalWeight",
        label: "What is your goal weight (kg)?",
        type: "number",
        placeholder: "65",
      },
      {
        name: "pushUps",
        label: "How many push-ups could you do in one go?",
        type: "number",
        placeholder: "15",
      },
      {
        name: "flexibility",
        label: "How flexible are you?",
        type: "radio",
        options: flexibilityOptions,
      },
    ],
  },
  {
    title: "Lifestyle & habits",
    description: "Choose zones to attack, share roadblocks, and map a routine that fits your day.",
    fields: [
      {
        name: "workoutsLast3Months",
        label: "How many times have you worked out in the last 3 months?",
        type: "number",
        placeholder: "12",
      },
      {
        name: "targetZones",
        label: "What are your target zones? (Choose all that apply)",
        type: "multi-select",
        options: targetZoneOptions,
      },
      {
        name: "struggles",
        label: "Do you struggle with any of the following?",
        type: "multi-select",
        options: struggleOptions,
      },
      {
        name: "trainingFrequency",
        label: "How many times per week would you like to train?",
        type: "radio",
        options: trainingFrequencyOptions,
      },
      {
        name: "workoutDuration",
        label: "How long do you want your workouts to be?",
        type: "radio",
        options: workoutDurationOptions,
      },
      {
        name: "workSchedule",
        label: "What is your work schedule like?",
        type: "radio",
        options: workScheduleOptions,
      },
      {
        name: "typicalDay",
        label: "How would you describe your typical day?",
        type: "textarea",
        placeholder: "Desk days, meetings, commute, family time...",
      },
    ],
  },
  {
    title: "Wellness & milestones",
    description:
      "Let's map your habits, cravings, and any important date so we keep it all in mind.",
    fields: [
      {
        name: "sleepHours",
        label: "How much sleep do you usually get (hours)?",
        type: "number",
        placeholder: "6.5",
      },
      {
        name: "waterIntake",
        label: "What's your daily water intake (liters)?",
        type: "number",
        placeholder: "2.5",
      },
      {
        name: "foodCravings",
        label: "What foods do you crave most often?",
        type: "text",
        placeholder: "Sweet treats, pasta, spicy curries...",
      },
      {
        name: "smoke",
        label: "Do you smoke?",
        type: "radio",
        options: ["No", "Occasionally", "Yes"],
      },
      {
        name: "alcoholFrequency",
        label: "How often do you drink alcohol?",
        type: "radio",
        options: alcoholOptions,
      },
      {
        name: "dietPreference",
        label: "What type of diet do you prefer?",
        type: "radio",
        options: dietOptions,
      },
      {
        name: "importantEvent",
        label: "Do you have an important event coming up?",
        type: "select",
        options: ["Yes", "No"],
        defaultValue: "No",
      },
      {
        name: "eventName",
        label: "Event title / milestone",
        type: "text",
        placeholder: "Wedding, Photoshoot, Reunion...",
        requiredIf: (values) => values.importantEvent === "Yes",
        conditional: (values) => values.importantEvent === "Yes",
      },
      {
        name: "eventDate",
        label: "When is your event?",
        type: "date",
        requiredIf: (values) => values.importantEvent === "Yes",
        conditional: (values) => values.importantEvent === "Yes",
      },
    ],
  },
  {
    title: "Plan ready",
    description:
      "Almost there. Review the plan we built, unlock your promo, and upload the progress proof.",
    fields: [],
    summary: true,
  },
];

const CalisthenicsOnboarding = () => {
  const { completeOnboarding } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState(() =>
    stepDefinitions.reduce((acc, step) => {
      step.fields?.forEach((field) => {
        acc[field.name] =
          field.type === "multi-select" ? field.defaultValue ?? [] : field.defaultValue ?? "";
      });
      return acc;
    }, {}),
  );
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const promoDuration = 5 * 60 * 1000;
  const [promoTimer, setPromoTimer] = useState(promoDuration);
  const promoCode = "BETTERME20";

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoTimer((prev) => Math.max(prev - 1000, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const step = useMemo(() => stepDefinitions[currentStep], [currentStep]);

  const handleInputChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleMultiToggle = useCallback((name, option) => {
    setValues((prev) => {
      const current = Array.isArray(prev[name]) ? prev[name] : [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [name]: next };
    });
  }, []);

  const shouldRequireField = (field) => {
    if (typeof field.requiredIf === "function") {
      return field.requiredIf(values);
    }
    return true;
  };

  const canContinue = useMemo(() => {
    if (step.summary) return true;
    return step.fields.every((field) => {
      if (field.conditional && !field.conditional(values)) {
        return true;
      }
      if (!shouldRequireField(field)) {
        return true;
      }
      const value = values[field.name];
      if (field.type === "multi-select") {
        return Array.isArray(value) && value.length > 0;
      }
      return String(value).trim().length > 0;
    });
  }, [step, values]);

  const goNext = () => {
    if (currentStep < stepDefinitions.length - 1 && canContinue) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const heightMeters = parseFloat(values.height || 0) / 100;
  const currentWeight = parseFloat(values.currentWeight || 0);
  const goalWeight = parseFloat(values.goalWeight || currentWeight || 60);
  const bmi =
    heightMeters && currentWeight ? currentWeight / (heightMeters * heightMeters) : 0;
  const bodyType = bmi < 18.5 ? "Ectomorph" : bmi < 25 ? "Mesomorph" : "Endomorph";
  const metabolism =
    bodyType === "Ectomorph"
      ? "Fast (tough to gain mass)"
      : bodyType === "Mesomorph"
        ? "Balanced and responsive"
        : "Slower, focus on calorie timing";
  const lifestyle = values.workSchedule || "Flexible lifestyle";
  const coachSuggestion = useMemo(() => {
    if (values.mainGoal === "Lose fat") return "Fat-loss Calisthenics Coach";
    if (values.mainGoal === "Build muscle") return "Strength & Hypertrophy Coach";
    if (values.mainGoal === "Improve endurance") return "Metabolic Conditioning Coach";
    if (values.mainGoal === "Master calisthenics") return "Calisthenics Flow Mentor";
    return "Performance + Mobility Coach";
  }, [values.mainGoal]);
  const motivationTip = values.motivation
    ? `Mini tip: split \"${values.motivation}\" into weekly micro-commitments.`
    : "Mini tip: stay consistent with short habits and hydrate often.";

  const projection = useMemo(() => {
    const diff = goalWeight - currentWeight;
    const mid = currentWeight + diff * 0.5;
    return [
      { label: "Now", weight: currentWeight || 65 },
      { label: "Target Week 3", weight: mid },
      { label: "Goal", weight: goalWeight || currentWeight || 65 },
    ];
  }, [currentWeight, goalWeight]);

  const minMax = useMemo(() => {
    const weights = projection.map((point) => point.weight);
    return {
      min: Math.min(...weights),
      max: Math.max(...weights),
    };
  }, [projection]);

  const formatPromoTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((milliseconds % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleFinish = useCallback(
    async ({ skipFeedback } = {}) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await completeOnboarding({
          ...values,
          promoRevealed: scratchRevealed,
          feedback: skipFeedback ? "Skipped feedback" : feedback,
          photoName: photo?.name ?? null,
        });
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Unable to complete onboarding:", error);
      } finally {
        setSubmitting(false);
      }
    },
    [completeOnboarding, feedback, navigate, photo, scratchRevealed, submitting, values],
  );

  const handleRevealPromo = () => {
    if (promoTimer > 0) {
      setScratchRevealed(true);
    }
  };

  const isSummaryStep = Boolean(step.summary);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white'>
      <div className='mx-auto max-w-5xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_60px_rgba(2,6,23,0.85)]'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
              Step {currentStep + 1} of {stepDefinitions.length}
            </p>
            <h1 className='text-3xl font-bold'>{step.title}</h1>
            <p className='text-sm text-slate-300'>{step.description}</p>
          </div>
          <div className='text-right text-xs text-slate-400'>
            <p className='text-base font-semibold text-white'>
              {values.name || "You"}
            </p>
            <p className='text-[11px] uppercase tracking-[0.25em]'>
              {coachSuggestion}
            </p>
          </div>
        </div>

        {isSummaryStep ? (
          <div className='space-y-6'>
            <div className='rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/60 via-slate-900 to-slate-950/70 p-6 shadow-[0_20px_45px_rgba(2,6,23,0.65)]'>
              <p className='text-xs uppercase tracking-[0.28em] text-slate-400'>
                BetterMe will keep you on track!
              </p>
              <h2 className='mt-2 text-2xl font-bold text-white'>
                Your 4-week Calisthenics Workout Plan is ready!
              </h2>
              <p className='mt-2 text-sm text-slate-300'>
                We want you to start your journey with a nice surprise, so keep
                an eye on the promo timer and stay motivated with pro tips.
              </p>
              <p className='mt-3 text-sm text-slate-200'>{motivationTip}</p>
              <ul className='mt-4 list-disc space-y-1 pl-5 text-sm text-slate-300'>
                <li>Progressive calisthenics programming for your level.</li>
                <li>Meal + hydration reminders aligned with your cravings.</li>
                <li>Events & goals embedded right into the training calendar.</li>
              </ul>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
                <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
                  BMI
                </p>
                <p className='mt-2 text-3xl font-bold text-white'>
                  {bmi ? bmi.toFixed(1) : "--"}
                </p>
                <p className='text-[11px] uppercase tracking-[0.3em] text-slate-400'>
                  {bodyType}
                </p>
                <p className='mt-3 text-sm text-slate-300'>Lifestyle: {lifestyle}</p>
              </div>
              <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
                <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
                  Fitness level
                </p>
                <p className='mt-2 text-2xl font-semibold text-white'>
                  {values.experience || "Fresh start"}
                </p>
                <p className='mt-3 text-sm text-slate-300'>{metabolism}</p>
              </div>
              <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
                <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
                  Coach tip
                </p>
                <p className='mt-2 text-lg font-semibold text-white'>
                  {coachSuggestion}
                </p>
                <p className='mt-2 text-sm text-slate-300'>
                  Target zones: {(values.targetZones || []).join(", ") || "Full body"}
                </p>
              </div>
            </div>

            <div className='rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
                Progress projection
              </p>
              <p className='mt-1 text-sm text-slate-300'>
                We predict you'll be {goalWeight.toFixed(1)} kg by{" "}
                {values.eventDate
                  ? new Date(values.eventDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                * ~{Math.abs(goalWeight - currentWeight).toFixed(1)} kg projected to your
                goal.
              </p>
              <div className='mt-4 grid grid-cols-3 gap-3'>
                {projection.map((point) => {
                  const range = Math.max(minMax.max - minMax.min, 1);
                  const normalized = ((point.weight - minMax.min) / range) * 100;
                  const barHeight = Math.max(normalized, 10);
                  return (
                    <div key={point.label} className='flex flex-col items-center gap-2'>
                      <div className='flex h-32 w-full items-end justify-center'>
                        <div
                          className='w-10 rounded-3xl bg-gradient-to-t from-red-500 to-orange-400'
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
                        {point.label}
                      </p>
                      <p className='text-sm font-semibold text-white'>
                        {point.weight.toFixed(1)} kg
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='rounded-3xl border border-red-500/40 bg-red-500/10 p-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-red-200'>
                Scratch to reveal your special discount!
              </p>
              <div className='mt-3 flex flex-col gap-2 text-sm'>
                <p>
                  Your promo code is applied! Timer counts down, and once it hits 0 the
                  discount closes.
                </p>
                <div className='flex flex-wrap items-center gap-3'>
                  <button
                    type='button'
                    onClick={handleRevealPromo}
                    disabled={promoTimer === 0}
                    className='rounded-2xl border border-red-400 bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50'>
                    Scratch to reveal
                  </button>
                  <span className='text-xs uppercase tracking-[0.3em] text-slate-200'>
                    {promoTimer > 0 ? formatPromoTime(promoTimer) : "Discount closed"}
                  </span>
                  {scratchRevealed && promoTimer > 0 && (
                    <span className='rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold'>
                      Code: {promoCode}
                    </span>
                  )}
                </div>
                <p className='text-xs text-slate-200'>
                  What you get: progressive calisthenics workouts, meal ideas, top 100 exercises,
                  1500 guided sessions, and hospitality-free programming.
                </p>
              </div>
            </div>

            <div className='rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5'>
              <div className='flex items-center gap-3'>
                <FaCamera className='text-red-400' />
                <p className='text-sm font-semibold text-white'>
                  Upload progress or transformation photo
                </p>
              </div>
              <p className='text-xs text-slate-400'>
                Share your first photo or feedback. You can skip this and still continue to
                the dashboard.
              </p>
              <label className='mt-4 flex flex-col gap-2 rounded-2xl border border-dashed border-slate-700/80 p-3 text-sm text-slate-300'>
                <span>Choose image (jpg, png)</span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
                  className='text-xs text-slate-300'
                />
                {photo?.name && (
                  <span className='text-[11px] text-slate-400'>
                    Selected: {photo.name}
                  </span>
                )}
              </label>
              <label className='mt-4 flex flex-col gap-2 text-sm text-slate-300'>
                <span>Feedback / transformation note</span>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className='resize-none rounded-2xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
                />
              </label>
            </div>
          </div>
        ) : (
          <div className='grid gap-5 md:grid-cols-2'>
            {step.fields.map((field) => {
              if (field.conditional && !field.conditional(values)) {
                return null;
              }

            if (field.type === "textarea") {
              return (
                  <label
                    key={field.name}
                    className='flex flex-col gap-2 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 transition hover:border-red-500'>
                    <span className='text-sm font-semibold text-slate-200'>
                      {field.label}
                    </span>
                    <textarea
                      rows={4}
                      placeholder={field.placeholder}
                      value={values[field.name]}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className='resize-none rounded-xl border border-transparent bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
                    />
                  </label>
                );
              }

            if (field.type === "radio") {
              return (
                <div
                  key={field.name}
                  className='flex flex-col gap-3 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 transition hover:border-red-500'>
                  <span className='text-sm font-semibold text-slate-200'>
                    {field.label}
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {field.options.map((option) => {
                      const isActive = values[field.name] === option;
                      return (
                        <button
                          key={option}
                          type='button'
                          onClick={() => handleInputChange(field.name, option)}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "border-red-500 bg-gradient-to-r from-red-500/70 to-orange-500 text-white"
                              : "border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500"
                          }`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (field.type === "select") {
              return (
                  <label
                    key={field.name}
                    className='flex flex-col gap-2 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 transition hover:border-red-500'>
                    <span className='text-sm font-semibold text-slate-200'>
                      {field.label}
                    </span>
                    <select
                      value={values[field.name]}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className='rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'>
                      <option value=''>Select</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }

            if (field.type === "multi-select") {
              return (
                <div
                  key={field.name}
                  className='flex flex-col gap-3 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 transition hover:border-red-500'>
                  <span className='text-sm font-semibold text-slate-200'>
                    {field.label}
                  </span>
                  <div className='flex flex-col gap-2'>
                    {field.options.map((option) => {
                      const selected = (values[field.name] || []).includes(option);
                      return (
                        <label
                          key={option}
                          className='flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-sm text-white transition'>
                          <input
                            type='checkbox'
                            checked={selected}
                            onChange={() => handleMultiToggle(field.name, option)}
                            className='h-4 w-4 rounded border-slate-600 bg-slate-800 text-red-500 focus:ring-red-500'
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (field.type === "radio") {
              return (
                <div
                  key={field.name}
                  className='flex flex-col gap-3 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 transition hover:border-red-500'>
                  <span className='text-sm font-semibold text-slate-200'>
                    {field.label}
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {field.options.map((option) => {
                      const isActive = values[field.name] === option;
                      return (
                        <button
                          key={option}
                          type='button'
                          onClick={() => handleInputChange(field.name, option)}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "border-red-500 bg-gradient-to-r from-red-500/70 to-orange-500 text-white"
                              : "border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500"
                          }`}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

              return (
                <label
                  key={field.name}
                  className='flex flex-col gap-2 rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 transition hover:border-red-500'>
                  <span className='text-sm font-semibold text-slate-200'>
                    {field.label}
                  </span>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={values[field.name]}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    className='rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
                  />
                </label>
              );
            })}
          </div>
        )}

        <div className='flex items-center justify-between border-t border-slate-800/50 pt-4 text-sm text-slate-400'>
          <button
            type='button'
            disabled={currentStep === 0}
            onClick={goBack}
            className='flex items-center gap-2 rounded-2xl border border-slate-800/60 bg-slate-800/60 px-4 py-2 font-semibold transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50'>
            <FaChevronLeft />
            Back
          </button>

          {isSummaryStep ? (
            <div className='flex flex-wrap items-center gap-3'>
              <button
                type='button'
                onClick={() => handleFinish({ skipFeedback: true })}
                disabled={submitting}
                className='rounded-2xl border border-slate-800/60 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-white transition hover:border-slate-600 disabled:opacity-50'>
                Skip & Continue
              </button>
              <button
                type='button'
                onClick={() => handleFinish()}
                disabled={submitting}
                className='flex items-center gap-2 rounded-2xl border border-red-500 bg-gradient-to-r from-red-500/80 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50'>
                {submitting ? "Finishing..." : "Finish & Go to Dashboard"}
                <FaChevronRight />
              </button>
            </div>
          ) : (
            <button
              type='button'
              onClick={goNext}
              disabled={!canContinue}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 font-semibold transition ${
                canContinue
                  ? "border-red-500 bg-gradient-to-r from-red-500/80 to-orange-500 text-white hover:brightness-110"
                  : "border-slate-800/60 bg-slate-800/60 text-slate-400 cursor-not-allowed"
              }`}>
              Next
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalisthenicsOnboarding;
