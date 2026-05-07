import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaAppleAlt, FaFire, FaClock, FaLeaf, FaStar } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const DietPlansPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get("/diet/plans");
        setPlans(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch diet plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const filteredPlans = filter === "all" ?
    plans
    : plans.filter((p) => p.category === filter);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
              Diet Plans
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Explore healthy meal plans tailored for your goals
            </p>
          </div>

          {user?.role === "coach" && (
            <button
              onClick={() => navigate("/coach/diet")}
              className='flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600'>
              <FaAppleAlt size={14} />
              Manage Client Diets
            </button>
          )}
        </div>

        {/* Filters */}
        <div className='flex gap-2'>
          {["all", "weight-loss", "muscle-gain", "maintenance"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === cat
                  ? "bg-orange-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              }`}>
              {cat === "all" ? "All Plans" : cat.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Plans Grid */}
        {filteredPlans.length === 0 ? (
          <div className='rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900'>
            <FaAppleAlt className='mx-auto mb-2 text-4xl text-slate-400' />
            <p className='text-slate-600 dark:text-slate-400'>
              No diet plans found.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className='group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900'>
                {/* Plan Image Placeholder */}
                <div className='h-40 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center'>
                  <FaAppleAlt className='text-6xl text-white opacity-80' />
                </div>

                <div className='p-5'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='rounded-full bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-400'>
                      {plan.category?.replace("-", " ") || "General"}
                    </span>
                    <div className='flex items-center gap-1 text-yellow-500'>
                      <FaStar size={12} />
                      <span className='text-sm'>{plan.rating || "4.5"}</span>
                    </div>
                  </div>

                  <h3 className='mb-2 text-xl font-bold text-slate-900 dark:text-white'>
                    {plan.title}
                  </h3>
                  <p className='mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400'>
                    {plan.description}
                  </p>

                  <div className='mb-4 flex items-center gap-4 text-sm text-slate-500'>
                    <span className='flex items-center gap-1'>
                      <FaFire className='text-orange-500' />
                      {plan.calories || "2000"} kcal
                    </span>
                    <span className='flex items-center gap-1'>
                      <FaClock className='text-blue-500' />
                      {plan.duration || "7"} days
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <p className='text-lg font-bold text-slate-900 dark:text-white'>
                      ₹{plan.price || 0}
                    </p>
                    <button
                      onClick={() => navigate(`/diet/my?plan=${plan._id}`)}
                      className='rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700'>
                      View Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DietPlansPage;
