import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaFire,
  FaClock,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const UserDietPage = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchDiet = async () => {
      try {
        const res = await API.get("/diet/my");
        setDietPlan(res.data.data);
        setTodayMeals(res.data.data?.todayMeals || []);
      } catch (error) {
        console.error("Failed to fetch diet:", error);
        setError(error.response?.data?.message || "No diet plan assigned");
      } finally {
        setLoading(false);
      }
    };

    fetchDiet();
  }, [user]);

  const getMealTypeIcon = (type) => {
    switch (type) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dietPlan) {
    return (
      <DashboardLayout>
        <div className='flex h-64 flex-col items-center justify-center'>
          <FaExclamationTriangle className='mb-2 text-4xl text-orange-500' />
          <p className='text-slate-600 dark:text-slate-400'>{error}</p>
          <button
            onClick={() => navigate("/diet/plans")}
            className='mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600'>
            Browse Diet Plans
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        {/* Header */}
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
                {dietPlan.title || "My Diet Plan"}
              </h1>
              <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                {dietPlan.description}
              </p>
            </div>
            <div className='flex gap-4'>
              <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
                <p className='text-sm text-blue-600 dark:text-blue-400'>
                  Total Calories
                </p>
                <p className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
                  {dietPlan.totalCalories || 0}
                </p>
              </div>
              <div className='rounded-lg bg-green-50 p-4 dark:bg-green-900/20'>
                <p className='text-sm text-green-600 dark:text-green-400'>
                  Duration
                </p>
                <p className='text-2xl font-bold text-green-700 dark:text-green-300'>
                  {dietPlan.duration || 7} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Meals */}
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h2 className='mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white'>
            <FaCalendarAlt className='text-orange-500' />
            Today&apos;s Meals
          </h2>

          {todayMeals?.length === 0 ? (
            <p className='text-center text-slate-500'>
              No meals scheduled for today.
            </p>
          ) : (
            <div className='space-y-3'>
              {todayMeals.map((meal, idx) => (
                <div
                  key={idx}
                  className='flex items-center gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700'>
                  <span className='text-3xl'>
                    {getMealTypeIcon(meal.mealType)}
                  </span>
                  <div className='flex-1'>
                    <p className='font-medium text-slate-900 dark:text-white'>
                      {meal.name}
                    </p>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>
                      {meal.description}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-slate-900 dark:text-white'>
                      {meal.calories} kcal
                    </p>
                    <p className='text-xs text-slate-500'>
                      {meal.time || "Anytime"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full Plan Overview */}
        {dietPlan.meals && dietPlan.meals.length > 0 && (
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h2 className='mb-4 text-xl font-semibold text-slate-900 dark:text-white'>
              Weekly Plan
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              {dietPlan.meals.map((dayPlan, idx) => (
                <div
                  key={idx}
                  className='rounded-lg border border-slate-200 p-4 dark:border-slate-700'>
                  <h3 className='mb-2 font-semibold text-slate-900 dark:text-white'>
                    Day {idx + 1}
                  </h3>
                  <ul className='space-y-1 text-sm text-slate-600 dark:text-slate-400'>
                    {dayPlan.map((m, i) => (
                      <li key={i}>
                        <span className='mr-2'>{getMealTypeIcon(m.type)}</span>
                        {m.name} ({m.calories} kcal)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Tips */}
        <div className='rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6 dark:border-slate-800 dark:from-slate-800 dark:to-slate-900'>
          <h3 className='mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white'>
            <FaLeaf className='text-green-500' />
            Nutrition Tips
          </h3>
          <ul className='space-y-2 text-sm text-slate-700 dark:text-slate-300'>
            <li>• Drink at least 8 glasses of water daily</li>
            <li>• Eat meals at consistent times</li>
            <li>• Include protein in every meal</li>
            <li>• Avoid processed foods and sugar</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDietPage;
