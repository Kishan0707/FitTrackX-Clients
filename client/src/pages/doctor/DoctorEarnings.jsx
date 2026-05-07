import { useContext, useEffect, useState } from "react";
import {
  FaMoneyBill,
  FaCalendarAlt,
  FaUserMd,
  FaChartLine,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

const DoctorEarnings = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    monthlyEarnings: [],
    recentTransactions: [],
  });

  useEffect(() => {
    if (!user) return;

    const fetchEarnings = async () => {
      try {
        const res = await API.get("/doctor/earnings");
        setEarnings(res.data.data || {
          totalEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
          monthlyEarnings: [],
          recentTransactions: [],
        });
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [user]);

  const earningsChartData = {
    labels: earnings.monthlyEarnings?.map((e) => e.month) || [],
    datasets: [
      {
        label: "Earnings (₹)",
        data: earnings.monthlyEarnings?.map((e) => e.total) || [],
        backgroundColor: "rgba(249, 115, 22, 0.6)",
        borderColor: "rgb(249, 115, 22)",
        borderWidth: 1,
      },
    ],
  };

  const trendData = {
    labels: earnings.monthlyEarnings?.map((e) => e.month) || [],
    datasets: [
      {
        label: "Earnings Trend",
        data: earnings.monthlyEarnings?.map((e) => e.total) || [],
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        tension: 0.4,
        fill: true,
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
            Earnings Dashboard
          </h1>
          <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
            Track your earnings and transaction history
          </p>
        </div>

        {/* KPIs */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaMoneyBill className='text-orange-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Total Earnings
              </p>
            </div>
            <p className='text-3xl font-bold text-slate-900 dark:text-white'>
              ₹{(earnings.totalEarnings || 0).toLocaleString()}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaChartLine className='text-amber-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Pending Earnings
              </p>
            </div>
            <p className='text-3xl font-bold text-amber-600 dark:text-amber-400'>
              ₹{(earnings.pendingEarnings || 0).toLocaleString()}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaUserMd className='text-green-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Paid Earnings
              </p>
            </div>
            <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
              ₹{(earnings.paidEarnings || 0).toLocaleString()}
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-2 flex items-center gap-2'>
              <FaCalendarAlt className='text-blue-500' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Transactions
              </p>
            </div>
            <p className='text-3xl font-bold text-slate-900 dark:text-white'>
              {earnings.recentTransactions?.length || 0}
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
              Earnings Trend
            </h3>
            <div className='h-80'>
              <Line data={trendData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='border-b border-slate-200 p-4 dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
              Recent Transactions
            </h3>
          </div>
          {earnings.recentTransactions?.length === 0 ?
            <div className='p-8 text-center text-slate-500 dark:text-slate-400'>
              No transactions yet
            </div>
          : <div className='divide-y divide-slate-200 dark:divide-slate-800'>
              {earnings.recentTransactions?.map((txn) => (
                <div
                  key={txn._id}
                  className='flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-orange-100 p-2 dark:bg-orange-900/30'>
                      <FaMoneyBill className='text-orange-500' />
                    </div>
                    <div>
                      <p className='font-medium text-slate-900 dark:text-white'>
                        {txn.patientName || "Patient"} -{" "}
                        {txn.type || "Consultation"}
                      </p>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        {new Date(txn.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-slate-900 dark:text-white'>
                      ₹{txn.amount?.toLocaleString() || 0}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs ${
                        txn.status === "paid" ?
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                      {txn.status || "pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorEarnings;
