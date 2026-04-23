import { useContext, useEffect, useState } from "react";
import {
  FaAppleAlt,
  FaCalendarAlt,
  FaChartLine,
  FaDumbbell,
  FaFire,
  FaPlus,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import StatCard from "../../components/StatCard";
import { AuthContext } from "../../context/authContext";
import API from "../../services/api";
import UserDashboardContent from "./UserDashboardContent";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [progressData, setProgressData] = useState({
    weightHistory: [],
    caloriesBurned: [],
    proteinIntake: [],
  });
  const [workouts, setWorkouts] = useState([]);
  const [coachRequest, setCoachRequest] = useState(null);
  const [stepRecords, setStepRecords] = useState([]);
  const [pendingStepTarget, setPendingStepTarget] = useState(null);
  const [todayDiet, setTodayDiet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchData = async ({ showLoader = false } = {}) => {
      if (!user) return;

      if (showLoader && isMounted) {
        setLoading(true);
      }

      try {
        if (user?.role === "admin") {
          const statsRes = await API.get("/admin/dashboard");

          if (!isMounted) return;

          setStats(statsRes.data.data || {});
        } else if (user?.role === "coach") {
          const statsRes = await API.get("/coach/dashboard");

          if (!isMounted) return;

          setStats(statsRes.data.data || {});
        } else {
          const results = await Promise.allSettled([
            API.get("/stats"),
            API.get("/progress/graphs"),
            API.get("/workouts"),
            API.get("/coach/my-request"),
            API.get("/steps/my"),
            API.get("/steps/pending-target"),
            API.get("/diet/today"),
          ]);

          if (!isMounted) return;

          const statsResult =
            results[0].status === "fulfilled" ? results[0].value.data.data : {};
          const progressResult =
            results[1].status === "fulfilled" ?
              results[1].value.data.data
            : { weightHistory: [], caloriesBurned: [], proteinIntake: [] };
          const workoutsResult =
            results[2].status === "fulfilled" ? results[2].value.data.data : [];
          const coachResult =
            results[3].status === "fulfilled" ?
              results[3].value.data.data
            : null;
          const stepsResult =
            results[4].status === "fulfilled" ? results[4].value.data.data : [];
          const pendingStepsResult =
            results[5].status === "fulfilled" ?
              results[5].value.data.data
            : null;
          const dietResult =
            results[6].status === "fulfilled" ?
              results[6].value.data.data
            : null;

          setStats(statsResult || {});
          setProgressData({
            weightHistory: progressResult?.weightHistory || [],
            caloriesBurned: progressResult?.caloriesBurned || [],
            proteinIntake: progressResult?.proteinIntake || [],
          });
          setWorkouts(Array.isArray(workoutsResult) ? workoutsResult : []);
          setCoachRequest(coachResult || null);
          console.log("Coach request data:", coachResult.data);
          setStepRecords(Array.isArray(stepsResult) ? stepsResult : []);
          setPendingStepTarget(pendingStepsResult || null);
          setTodayDiet(
            dietResult && Object.keys(dietResult).length > 0 ?
              dietResult
            : null,
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (showLoader && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData({ showLoader: true });

    if (user?.role === "user") {
      intervalId = window.setInterval(() => {
        fetchData();
      }, 15000);
    }

    return () => {
      isMounted = false;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [user]);

  let content = null;

  if (loading) {
    content = (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-red-500'></div>
      </div>
    );
  } else if (user?.role === "admin") {
    content = (
      <>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-slate-900 dark:text-white'>
            Admin Dashboard
          </h1>
          <p className='text-slate-600 dark:text-slate-400'>
            Monitor your fitness platform&apos;s performance
          </p>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          <StatCard
            title='Total Users'
            value={stats.totalUsers || 0}
            icon={<FaUsers />}
          />
          <StatCard
            title='Total Workouts'
            value={stats.totalWorkouts || 0}
            icon={<FaDumbbell />}
          />
          <StatCard
            title='Total Diet Logs'
            value={stats.totalDiets || 0}
            icon={<FaAppleAlt />}
          />
          <StatCard
            title='Total Calories Burned'
            value={stats.totalCaloriesBurned || 0}
            icon={<FaFire />}
          />
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 flex items-center text-xl font-semibold'>
              <FaChartLine className='mr-2 text-red-500' />
              Platform Overview
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Active Users</span>
                <span className='font-semibold'>{stats.totalUsers || 0}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Total Activities</span>
                <span className='font-semibold'>
                  {(stats.totalWorkouts || 0) + (stats.totalDiets || 0)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Avg. Calories/User</span>
                <span className='font-semibold'>
                  {stats.totalUsers && stats.totalCaloriesBurned ?
                    Math.round(stats.totalCaloriesBurned / stats.totalUsers)
                  : 0}
                </span>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 flex items-center text-xl font-semibold'>
              <FaUsers className='mr-2 text-red-500' />
              Quick Actions
            </h3>
            <div className='space-y-3'>
              <button className='w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'>
                Manage Users
              </button>
              <button className='w-full rounded-lg bg-slate-200 px-4 py-2 text-slate-900 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'>
                View Reports
              </button>
              <button className='w-full rounded-lg bg-slate-200 px-4 py-2 text-slate-900 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'>
                System Settings
              </button>
            </div>
          </div>
        </div>
      </>
    );
  } else if (user?.role === "coach") {
    content = (
      <>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-slate-900 dark:text-white'>
            Coach Dashboard
          </h1>
          <p className='text-slate-600 dark:text-slate-400'>
            Manage your clients and track their progress
          </p>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          <StatCard
            title='My Clients'
            value={stats.totalClients || 0}
            icon={<FaUsers />}
          />
          <StatCard
            title='Active Plans'
            value={stats.activePlans || 0}
            icon={<FaDumbbell />}
          />
          <StatCard
            title='This Month Sessions'
            value={stats.monthlySessions || 0}
            icon={<FaCalendarAlt />}
          />
          <StatCard
            title='Total Workouts Assigned'
            value={stats.totalWorkoutsAssigned || 0}
            icon={<FaTrophy />}
          />
        </div>

        <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 flex items-center text-xl font-semibold'>
              <FaChartLine className='mr-2 text-red-500' />
              Client Overview
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Active Clients</span>
                <span className='font-semibold'>{stats.totalClients || 0}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Active Plans</span>
                <span className='font-semibold'>{stats.activePlans || 0}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Sessions This Month</span>
                <span className='font-semibold'>
                  {stats.monthlySessions || 0}
                </span>
              </div>
            </div>
          </div>

          <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 flex items-center text-xl font-semibold'>
              <FaUsers className='mr-2 text-red-500' />
              Client Progress
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Avg. Weight Loss</span>
                <span className='font-semibold text-green-400'>
                  {stats.avgWeightLoss || 0} kg
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Completed Workouts</span>
                <span className='font-semibold'>
                  {stats.completedWorkouts || 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 dark:text-slate-400'>Client Satisfaction</span>
                <span className='font-semibold text-yellow-400'>
                  {stats.clientSatisfaction || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h3 className='mb-4 flex items-center text-xl font-semibold'>
            <FaPlus className='mr-2 text-red-500' />
            Quick Actions
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <button className='flex items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-700'>
              <FaUsers className='mr-2' />
              Manage Clients
            </button>
            <button className='flex items-center justify-center rounded-lg bg-slate-200 px-4 py-2 text-slate-900 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'>
              <FaDumbbell className='mr-2' />
              Assign Workout
            </button>
            <button className='flex items-center justify-center rounded-lg bg-slate-200 px-4 py-2 text-slate-900 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'>
              <FaChartLine className='mr-2' />
              View Progress
            </button>
          </div>
        </div>
      </>
    );
  } else {
    content = (
      <UserDashboardContent
        coachRequest={coachRequest}
        pendingStepTarget={pendingStepTarget}
        progressData={progressData}
        stats={stats}
        stepRecords={stepRecords}
        todayDiet={todayDiet}
        user={user}
        workouts={workouts}
      />
    );
  }

  return <DashboardLayout>{content}</DashboardLayout>;
};

export default Dashboard;
