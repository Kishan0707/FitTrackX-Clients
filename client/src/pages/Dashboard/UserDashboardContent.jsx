import { useNavigate } from "react-router-dom";
import {
  FaAppleAlt,
  FaArrowRight,
  FaBullseye,
  FaCalendarAlt,
  FaChartLine,
  FaCrown,
  FaDumbbell,
  FaRobot,
  FaShoppingBag,
  FaWalking,
  FaWeight,
} from "react-icons/fa";
import RecentWorkouts from "../../components/RecentWorkout";
import StatCard from "../../components/StatCard";
import WeightChart from "../../components/WeightChart";
import API from "../../services/api";
import { useEffect, useState } from "react";

const isSameDay = (value, compareDate = new Date()) => {
  if (!value) return false;

  const left = new Date(value);
  const right = new Date(compareDate);

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const formatShortDate = (value) => {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const formatTitle = (value) => {
  if (!value) return "Not set";

  return String(value)
    .split(" ")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
};

const getMealCalories = (meal = {}) =>
  (meal.foods || []).reduce((sum, food) => sum + (food.calories || 0), 0);

const ActionCard = ({ icon, title, description, onClick, primary = false }) => (
  <button
    type='button'
    onClick={onClick}
    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
      primary ?
        "border-red-500/20 bg-red-500/10 text-white hover:bg-red-500/15"
      : "border-slate-800 bg-slate-800/70 text-slate-100 hover:border-slate-700 hover:bg-slate-800"
    }`}>
    <div className='flex min-w-0 items-center gap-3'>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
          primary ? "bg-red-500/20 text-red-200" : "bg-slate-900 text-slate-300"
        }`}>
        {icon}
      </div>
      <div className='min-w-0'>
        <p className='truncate font-semibold'>{title}</p>
        <p className='truncate text-xs text-slate-400'>{description}</p>
      </div>
    </div>
    <FaArrowRight className='shrink-0 text-xs text-slate-500' />
  </button>
);

const TodayTile = ({ icon, title, value, subtext, accentClass, children }) => (
  <div className='rounded-2xl border border-slate-800 bg-slate-900/80 p-5'>
    <div className='flex items-start justify-between gap-3'>
      <div>
        <p className='text-xs uppercase tracking-[0.22em] text-slate-500'>
          {title}
        </p>
        <p className='mt-2 text-2xl font-bold text-white'>{value}</p>
        <p className='mt-1 text-sm text-slate-400'>{subtext}</p>
      </div>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${accentClass}`}>
        {icon}
      </div>
    </div>
    {children ?
      <div className='mt-4'>{children}</div>
    : null}
  </div>
);

const healthTips = [
  {
    title: "Hydration Focus",
    detail: "Drink 25ml/kg body weight daily between meals.",
  },
  {
    title: "Protein First",
    detail: "Target 25–30g protein across every meal to protect muscle.",
  },
  {
    title: "Micro-breaks",
    detail: "Stand & stretch every 60 minutes to reset posture.",
  },
];

const UserDashboardContent = ({
  coachRequest,
  progressData,
  stats,
  stepRecords,
  todayDiet,
  user,
  workouts,
}) => {
  const onboardingData = user?.onboardingData || null;
  console.log("User data in dashboard:", user.goal);
  console.log("Progress data:", progressData);
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState("");
  const [pendingStepTarget, setPendingStepTarget] = useState(null);
  const [coachData, setCoachData] = useState(null);
  const [goal, setGoal] = useState(null);
  const [plan, setPlan] = useState(null);
  const [weight, setWeight] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  let isExpired;
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await API.get(`/subscriptions/my-subscription`);
        console.log("Subscription data:", res.data);
        const coachName = res.data.data.planId?.coachId?.name || null;
        const userGoal = res.data.data.userGoal;

        // agar coach target system nahi hai abhi
        const finalGoal = userGoal;
        setSubscription(
          res.data.data.planId?.coachId?.name ?
            res.data.data.planId?.coachId?.name
          : "Free Membership",
        );
        setPlan(res.data.data.plan || null);
        setCoachData(coachName || null);
        setGoal(user?.goal || null);
        console.log("Goal", user);
        console.log("Goal from subscription:", res.data);
        const endDate = res.data.data.endDate;
        isExpired = new Date(endDate) < new Date();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchStepTarget = async () => {
      try {
        const res = await API.get("/steps/my");

        const stepsArray = res.data.data; // ✅ correct

        const latestStep = stepsArray.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )[0];

        console.log("Latest step target:", latestStep);

        setPendingStepTarget(latestStep); // ✅ object set karo
      } catch (error) {
        console.log(error);
      }
    };
    const fetchBodyMeasurement = async () => {
      const res = await API.get("/body-measurements/latest");
      console.log("Body measurement data:", res);
      const latest = res.data.data;
      setWeight(latest?.weight || 0);
      console.log("Weight:", latest?.weight || 0);
    };

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await API.get("/products");
        setProducts(res.data.data || []);
      } catch (error) {
        console.error("Product fetch failed:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchSubscription();
    fetchStepTarget();
    fetchBodyMeasurement();
    fetchProducts();
  }, []);

  const sortedWorkouts = [...workouts].sort(
    (left, right) =>
      new Date(right.createdAt || right.date) -
      new Date(left.createdAt || left.date),
  );
  const recentWorkouts = sortedWorkouts.slice(0, 4);
  const todayWorkoutEntries = sortedWorkouts.filter((workout) =>
    isSameDay(workout.createdAt || workout.date),
  );
  const todayWorkoutCalories = todayWorkoutEntries.reduce(
    (sum, workout) => sum + (workout.caloriesBurned || 0),
    0,
  );

  const weightHistory = progressData.weightHistory || [];
  const latestWeight = weightHistory.at(-1)?.weight ?? user?.weight ?? null;
  const firstWeight = weightHistory[0]?.weight ?? latestWeight;
  const weightDelta =
    latestWeight !== null && firstWeight !== null ?
      (latestWeight - firstWeight).toFixed(1)
    : null;

  const todayStepRecord =
    stepRecords.find((record) => isSameDay(record.date)) ||
    stepRecords[0] ||
    null;
  const stepGoal = pendingStepTarget?.goal || todayStepRecord?.goal || 0;
  const todaySteps = todayStepRecord?.steps || 0;
  const stepsCompletion =
    stepGoal > 0 ? Math.min(Math.round((todaySteps / stepGoal) * 100), 100) : 0;

  const todayMeals = todayDiet?.meals || [];
  const membershipLabel =
    String(user?.subscription || "free").toLowerCase() === "paid" ?
      "Paid Membership"
    : "Free Membership";

  const coachStatusMeta =
    coachRequest?.status === "accepted" ?
      {
        badge: "Coach Active",
        headline: `Coach assigned - ${coachRequest.coachId?.name || "Your coach"}`,
        note:
          coachRequest.target ?
            `Current target: ${coachRequest.target}`
          : "Your coach can now guide your workouts, diet, and progress.",
        tone: "border-green-500/30 bg-green-500/10",
      }
    : coachRequest?.status === "pending" ?
      {
        badge: "Awaiting Response",
        headline: `Coach request pending - ${coachRequest.coachId?.name || "Coach"}`,
        note:
          coachRequest.target ?
            `Requested target: ${coachRequest.target}`
          : "Your coach request is waiting for confirmation.",
        tone: "border-yellow-500/30 bg-yellow-500/10",
      }
    : coachRequest?.status === "rejected" ?
      {
        badge: "Coach Unavailable",
        headline: `Request rejected by ${coachRequest.coachId?.name || "coach"}`,
        note: "You can still keep logging workouts, meals, and progress.",
        tone: "border-red-500/30 bg-red-500/10",
      }
    : {
        badge: "Self Guided",
        headline: "Build your routine and stay consistent this week.",
        note:
          user?.goal ?
            `Current goal: ${formatTitle(user.goal)}`
          : "Choose a goal and start tracking daily progress.",
        tone: "border-slate-700 bg-slate-900/80",
      };
  const performanceScore = Math.round(
    stepsCompletion * 0.4 +
      (todayWorkoutEntries.length > 0 ? 30 : 0) +
      (todayDiet ? 30 : 0),
  );
  const weeklyWorkouts = workouts.filter((w) => {
    const date = new Date(w.createdAt);
    const now = new Date();
    return (now - date) / (1000 * 60 * 60 * 24) <= 7;
  });
  return (
    <>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white sm:text-3xl'>
              My Dashboard
            </h1>
            <p className='mt-2 text-sm text-slate-400 sm:text-base'>
              Track your fitness journey, today&apos;s progress, and the next
              best action.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <span className='rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300'>
              {subscription ? formatTitle(subscription) : "No subscription"} •{" "}
              {isExpired ? "Expired ❌" : "Active ✅"}
            </span>
            <span className='rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300'>
              Goal: {formatTitle(goal) || "Not set"}
            </span>
          </div>
        </div>
        {onboardingData ?
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
                BMI
              </p>
              <p className='mt-2 text-2xl font-bold text-white'>
                {onboardingData.bmi ? onboardingData.bmi.toFixed(1) : "--"}
              </p>
              <p className='text-[11px] uppercase tracking-[0.3em] text-slate-400'>
                {onboardingData.bodyType || "Not set"}
              </p>
              <p className='mt-2 text-sm text-slate-400'>
                {onboardingData.metabolism || "Lifestyle not available"}
              </p>
            </div>
            <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
                Coach suggestion
              </p>
              <p className='mt-2 text-lg font-semibold text-white'>
                {onboardingData.coachSuggestion || "Auto coach"}
              </p>
              <p className='mt-2 text-sm text-slate-400'>
                {onboardingData.lifestyle || "Lifestyle not recorded"}
              </p>
            </div>
            <div className='rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
                Projection
              </p>
              <div className='mt-2 space-y-2'>
                {(onboardingData.projection || []).map((point) => (
                  <div
                    key={point.label}
                    className='flex items-center justify-between text-sm text-slate-300'>
                    <span>{point.label}</span>
                    <span className='font-semibold text-white'>
                      {point.weight?.toFixed(1) ?? "--"} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        : null}
        <div className='grid gap-4 xl:grid-cols-[1.6fr,1fr]'>
          <div
            className={`rounded-2xl border p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)] ${coachStatusMeta.tone}`}>
            <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
              <div>
                <span className='rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200'>
                  {coachStatusMeta.badge}
                </span>
                <h2 className='mt-4 text-xl font-semibold text-white sm:text-2xl'>
                  {coachStatusMeta.headline}
                </h2>
                <p className='mt-2 max-w-2xl text-sm text-slate-300'>
                  {coachStatusMeta.note}
                </p>
              </div>

              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div className='rounded-2xl border border-slate-800 bg-slate-950/50 p-4'>
                  <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                    Coach
                  </p>
                  <p className='mt-2 font-semibold text-white'>
                    {coachData ? `${coachData}` : "No coach assigned"}
                  </p>
                </div>
                <div className='rounded-2xl border border-slate-800 bg-slate-950/50 p-4'>
                  <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                    Target
                  </p>
                  <p className='mt-2 font-semibold text-white'>
                    {(
                      coachRequest?.status === "accepted" &&
                      coachRequest?.target
                    ) ?
                      coachRequest.target
                    : formatTitle(user?.goal) || "No target"}
                  </p>
                </div>
                <div className='rounded-2xl border border-slate-800 bg-slate-950/50 p-4'>
                  <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                    Steps Goal
                  </p>
                  <p className='mt-2 font-semibold text-white'>
                    {pendingStepTarget?.goal || "No target"}
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-5 flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={() => navigate("/progress")}
                className='rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700'>
                View Progress
              </button>
              <button
                type='button'
                onClick={() => navigate(stepGoal ? "/steps" : "/plans")}
                className='rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-900'>
                {stepGoal ? "Open Steps Tracker" : "Explore Plans"}
              </button>
            </div>
          </div>

          <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs uppercase tracking-[0.22em] text-slate-500'>
                  Membership
                </p>
                <h3 className='mt-2 text-xl font-semibold text-white'>
                  {subscription ? plan : membershipLabel}
                </h3>
                <p className='mt-1 text-sm text-slate-400'>
                  {String(subscription || "free").toLowerCase() === "paid" ?
                    "Premium access enabled for your fitness journey."
                  : "Upgrade to unlock paid plans and coach-led guidance."}
                </p>
              </div>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-lg text-red-300'>
                <FaCrown />
              </div>
            </div>

            <div className='mt-6 space-y-3'>
              <h3 className='text-lg font-semibold text-white sm:text-xl'>
                Shop the coach store
              </h3>
              {loadingProducts ?
                <p className='text-sm text-slate-400'>Loading products…</p>
              : products.length === 0 ?
                <p className='text-sm text-slate-400'>
                  No coach products are live yet.
                </p>
              : <>
                  <div className='grid gap-3 md:grid-cols-2'>
                    {products.slice(0, 4).map((product) => (
                      <div
                        key={product._id}
                        className='flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4'>
                        <div className='flex items-center justify-between text-sm text-slate-400'>
                          <span>
                            {product.coach?.name ?
                              product.coach.name
                            : "Coach kit"}
                          </span>
                          <span className='text-xs uppercase tracking-[0.3em] text-slate-500'>
                            GST {product.gstRate ?? 18}%
                          </span>
                        </div>
                        <h4 className='text-lg font-semibold text-white'>
                          {product.name}
                        </h4>
                        <p className='text-xs text-slate-400 line-clamp-3'>
                          {product.description ||
                            "Coach did not add details yet."}
                        </p>
                        <div className='flex items-center justify-between text-sm text-slate-400'>
                          <span>Final ₹{product.finalPrice?.toFixed(2)}</span>
                          <span className='text-xs text-slate-500'>
                            GST ₹{product.gstAmount?.toFixed(2) ?? "0.00"}
                          </span>
                        </div>
                        <button
                          type='button'
                          className='self-start rounded-full border border-red-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-300'>
                          View detail
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type='button'
                    className='mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 hover:text-white'
                    onClick={() => navigate("/products")}>
                    View all products
                  </button>
                </>
              }
            </div>
          </div>

          <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]'>
            <h3 className='mb-3 text-xl font-semibold text-white'>
              Health tips
            </h3>
            <div className='grid gap-3 sm:grid-cols-2'>
              {healthTips.map((tip) => (
                <div
                  key={tip.title}
                  className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300'>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
                    {tip.title}
                  </p>
                  <p className='mt-1 text-sm'>{tip.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-5 space-y-3'>
            <div className='flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3'>
              <span className='text-sm text-slate-400'>Workout goal</span>
              <span className='text-sm font-semibold text-white'>
                {coachRequest?.target ?
                  formatTitle(coachRequest.target)
                : user?.goal ?
                  formatTitle(user.goal)
                : "No Target Set"}
              </span>
            </div>
            <div className='flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3'>
              <span className='text-sm text-slate-400'>Latest weight</span>
              <span className='text-sm font-semibold text-white'>
                {`${weight} kg` || "No data"}
              </span>
            </div>
          </div>

          <button
            type='button'
            onClick={() => navigate("/plans")}
            className='mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900'>
            View Plans
            <FaArrowRight className='text-xs' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          title='Calories Burned'
          value={stats.totalCaloriesBurned || 0}
          icon={<FaChartLine />}
        />
        <StatCard
          title='Workouts'
          value={stats.totalWorkouts || 0}
          icon={<FaDumbbell />}
        />
        <StatCard
          title='Protein Intake'
          value={stats.totalProteinIntake || 0}
          icon={<FaAppleAlt />}
        />
        <StatCard
          title='Workout Streak'
          value={stats.workoutStrike || 0}
          icon={<FaBullseye />}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <TodayTile
          title='Weekly Workouts'
          value={weeklyWorkouts.length}
          subtext='Last 7 days activity'
          icon={<FaChartLine />}
          accentClass='bg-cyan-500/10 text-cyan-300'
        />
        <TodayTile
          title="Today's Score"
          value={`${performanceScore}%`}
          subtext='Based on activity, workouts, and diet'
          icon={<FaBullseye />}
          accentClass='bg-yellow-500/10 text-yellow-300'
        />
        <TodayTile
          title='Today Steps'
          value={todaySteps.toLocaleString()}
          subtext={
            stepGoal ?
              `${stepsCompletion}% of ${stepGoal.toLocaleString()} goal`
            : "Set or accept a step goal to track progress"
          }
          icon={<FaWalking />}
          accentClass='bg-blue-500/10 text-blue-300'>
          <div className='h-2.5 rounded-full bg-slate-800'>
            <div
              className='h-2.5 rounded-full bg-blue-500 transition-all duration-300'
              style={{ width: `${stepGoal ? stepsCompletion : 0}%` }}
            />
          </div>
        </TodayTile>

        <TodayTile
          title='Today Nutrition'
          value={
            todayDiet ?
              `${Math.round(todayDiet.totalCalories || 0)} kcal`
            : "No meals"
          }
          subtext={
            todayDiet ?
              `${Math.round(todayDiet.totalProtein || 0)}g protein across ${todayMeals.length} meals`
            : "Log your first meal for today"
          }
          icon={<FaAppleAlt />}
          accentClass='bg-emerald-500/10 text-emerald-300'
        />

        <TodayTile
          title='Today Workouts'
          value={todayWorkoutEntries.length}
          subtext={
            todayWorkoutEntries.length > 0 ?
              `${todayWorkoutCalories.toLocaleString()} calories burned today`
            : "No workout logged yet today"
          }
          icon={<FaDumbbell />}
          accentClass='bg-red-500/10 text-red-300'
        />

        <TodayTile
          title='Latest Weight'
          value={latestWeight !== null ? `${latestWeight} kg` : "No data"}
          subtext={
            weightDelta !== null ?
              `${Number(weightDelta) >= 0 ? "+" : ""}${weightDelta} kg since first record`
            : "Add progress entries to track changes"
          }
          icon={<FaWeight />}
          accentClass='bg-violet-500/10 text-violet-300'
        />
      </div>
      <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]'>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <div>
            <h3 className='text-lg font-semibold text-white sm:text-xl'>
              Quick Actions
            </h3>
            <p className='text-sm text-slate-400'>
              Jump straight to the task you want to log or review.
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
          <ActionCard
            icon={<FaDumbbell />}
            title='Add Workout'
            description='Log a new workout session'
            onClick={() => navigate("/add-workout")}
            primary
          />
          <ActionCard
            icon={<FaAppleAlt />}
            title='Log Meal'
            description='Track nutrition for today'
            onClick={() => navigate("/add-meal")}
          />
          <ActionCard
            icon={<FaWalking />}
            title='Log Steps'
            description='Update today step count'
            onClick={() => navigate("/steps")}
          />
          <ActionCard
            icon={<FaChartLine />}
            title='View Progress'
            description='Open charts and monthly comparison'
            onClick={() => navigate("/progress")}
          />
          <ActionCard
            icon={<FaBullseye />}
            title='Workout Analytics'
            description='Check trends and distribution'
            onClick={() => navigate("/workout-analytics")}
          />
          <ActionCard
            icon={<FaRobot />}
            title='AI Trainer'
            description='Generate a guided workout plan'
            onClick={() => navigate("/ai")}
          />
          <ActionCard
            icon={<FaCalendarAlt />}
            title='Workout History'
            description='Review and filter old workouts'
            onClick={() => navigate("/workout-history")}
          />
          <ActionCard
            icon={<FaCrown />}
            title='Plans'
            description='Browse subscription options'
            onClick={() => navigate("/plans")}
          />
        </div>
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.45fr,1fr]'>
        <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-lg font-semibold text-white sm:text-xl'>
                Weight Progress
              </h3>
              <p className='text-sm text-slate-400'>
                A quick view of your recorded weight trend.
              </p>
            </div>
            <button
              type='button'
              onClick={() => navigate("/progress")}
              className='rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:bg-slate-900'>
              Open Progress
            </button>
          </div>
          <WeightChart data={weightHistory} />
        </div>

        <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-lg font-semibold text-white sm:text-xl'>
                Meals Today
              </h3>
              <p className='text-sm text-slate-400'>
                Preview of today&apos;s logged meals and calories.
              </p>
            </div>
            <button
              type='button'
              onClick={() => navigate("/add-meal")}
              className='rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:bg-slate-900'>
              Open Diet
            </button>
          </div>

          {todayMeals.length === 0 ?
            <div className='rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center'>
              <p className='text-sm text-slate-400'>
                No meals logged yet for today.
              </p>
            </div>
          : <div className='space-y-3'>
              {todayMeals.slice(0, 4).map((meal, index) => (
                <div
                  key={`${meal.mealName || "meal"}-${index}`}
                  className='flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4'>
                  <div className='min-w-0'>
                    <p className='truncate font-medium text-white'>
                      {meal.mealName || `Meal ${index + 1}`}
                    </p>
                    <p className='text-xs text-slate-400'>
                      {(meal.foods || []).length} food item(s)
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-white'>
                      {Math.round(getMealCalories(meal))} kcal
                    </p>
                    <p className='text-xs text-slate-500'>
                      {formatShortDate(todayDiet?.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]'>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <div>
            <h3 className='text-lg font-semibold text-white sm:text-xl'>
              Recent Workouts
            </h3>
            <p className='text-sm text-slate-400'>
              Your latest logged workout sessions at a glance.
            </p>
          </div>
          <button
            type='button'
            onClick={() => navigate("/workout-history")}
            className='rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:bg-slate-900'>
            View History
          </button>
        </div>
        <RecentWorkouts workouts={recentWorkouts} />
      </div>
    </>
  );
};

export default UserDashboardContent;
