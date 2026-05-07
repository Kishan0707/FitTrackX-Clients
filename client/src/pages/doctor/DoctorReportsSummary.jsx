import { useContext, useEffect, useState } from "react";
import { FaChartBar, FaCalendarAlt, FaUserMd, FaMoneyBill } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const DoctorReportsSummary = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalEarnings: 0,
    monthlyEarnings: [],
    appointmentsByDay: [],
  });

  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      try {
        const res = await API.get("/doctor/reports/summary/appointments");
        setStats(res.data.data || stats);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const earningsChartData = {
    labels: stats.monthlyEarnings?.map((e) => e.month) || [],
    datasets: [
      {
        label: "Earnings (₹)",
        data: stats.monthlyEarnings?.map((e) => e.total) || [],
        backgroundColor: "rgba(249, 115, 22, 0.6)",
        borderColor: "rgb(249, 115, 22)",
        borderWidth: 1,
      },
    ],
  };

  const apptsByDayData = {
    labels: stats.appointmentsByDay?.map((d) => d.day) || [],
    datasets: [
      {
        label: "Appointments",
        data: stats.appointmentsByDay?.map((d) => d.count) || [],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
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

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
            Reports Summary
          </h1>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Overview of your appointments and earnings
          </p>
        </div>

        {/* KPIs */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaCalendarAlt className='text-blue-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Total Appointments
              </p>
            </div>
            <p className='text-3xl font-bold text-slate-900 dark:text-white'>
              {stats.totalAppointments || 0}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaUserMd className='text-green-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Completed
              </p>
            </div>
            <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
              {stats.completedAppointments || 0}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaCalendarAlt className='text-red-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Cancelled
              </p>
            </div>
            <p className='text-3xl font-bold text-red-600 dark:text-red-400'>
              {stats.cancelledAppointments || 0}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaMoneyBill className='text-emerald-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Total Earnings
              </p>
            </div>
            <p className='text-3xl font-bold text-emerald-600 dark:text-emerald-400'>
              ₹{(stats.totalEarnings || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-white'>
              Monthly Earnings
            </h3>
            <div className='h-80'>
              <Bar data={earningsChartData} options={chartOptions} />
            </div>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 text-lg font-semibold text-slate-900 dark:text-white'>
              Appointments by Day
            </h3>
            <div className='h-80'>
              <Bar data={apptsByDayData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorReportsSummary;
