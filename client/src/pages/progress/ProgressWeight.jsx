import { useContext, useEffect, useState } from "react";
import { FaWeight, FaCalendarAlt, FaChartLine, FaPlus, FaTrash } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const ProgressWeight = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const res = await API.get("/progress/weight");
        setRecords(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch weight progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/progress/weight", {
        weight: Number(newWeight),
        date: newDate,
      });
      const res = await API.get("/progress/weight");
      setRecords(res.data.data || []);
      setShowModal(false);
      setNewWeight("");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save weight");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await API.delete(`/progress/weight/${id}`);
      setRecords(records.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const chartData = {
    labels: records.map((r) => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: "Weight (kg)",
        data: records.map((r) => r.weight),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { beginAtZero: false },
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
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
              Weight Tracking
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Track your weight progress over time
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className='flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600'>
            <FaPlus size={14} />
            Log Weight
          </button>
        </div>

        {/* Chart */}
        {records.length > 0 && (
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white'>
              <FaChartLine className='text-blue-500' />
              Weight Graph
            </h3>
            <div className='h-80'>
              <Line data={chartData} options={options} />
            </div>
          </div>
        )}

        {/* History Table */}
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='border-b border-slate-200 p-4 dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
              History
            </h3>
          </div>

          {records.length === 0 ? (
            <div className='p-8 text-center text-slate-500'>
              <FaWeight className='mx-auto mb-2 text-3xl' />
              <p>No weight records yet.</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                  <tr>
                    <th className='px-4 py-3 text-left'>Date</th>
                    <th className='px-4 py-3 text-left'>Weight (kg)</th>
                    <th className='px-4 py-3 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                  {[...records]
                    .sort(
                      (a, b) =>
                        new Date(b.date) - new Date(a.date),
                    )
                    .map((record) => (
                      <tr
                        key={record._id}
                        className='hover:bg-slate-50 dark:hover:bg-slate-800/50'>
                        <td className='px-4 py-3 text-slate-900 dark:text-white'>
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className='px-4 py-3 text-xl font-bold text-slate-900 dark:text-white'>
                          {record.weight}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          <button
                            onClick={() => handleDelete(record._id)}
                            className='rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition'>
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900'>
              <h3 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                Log Weight
              </h3>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Weight (kg)
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    required
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Date
                  </label>
                  <input
                    type='date'
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  />
                </div>
                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={saving}
                    className='flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 text-white transition hover:bg-orange-600 disabled:opacity-50'>
                    <FaCheck size={14} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProgressWeight;
