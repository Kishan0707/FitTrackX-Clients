import { useContext, useEffect, useState } from "react";
import {
  FaRuler,
  FaRulerVertical,
  FaSave,
  FaHistory,
  FaBalanceScale,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const ProgressMeasurements = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    chest: "",
    waist: "",
    hips: "",
    biceps: "",
    thighs: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await API.get("/progress/measurements");
        setLatest(res.data.data?.latest || null);
        setHistory(res.data.data?.history || []);
      } catch (error) {
        console.error("Failed to fetch measurements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/progress/measurements", formData);
      const res = await API.get("/progress/measurements");
      setLatest(res.data.data?.latest || null);
      setHistory(res.data.data?.history || []);
      setShowForm(false);
      setFormData({
        weight: "",
        height: "",
        chest: "",
        waist: "",
        hips: "",
        biceps: "",
        thighs: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save measurements");
    } finally {
      setSaving(false);
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

  return (
    <DashboardLayout>
      <div className='space-y-6 p-4 md:p-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
              Body Measurements
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Track changes in your body dimensions
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className='flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600'>
            <FaSave size={14} />
            Log Measurements
          </button>
        </div>

        {/* Latest Measurements Summary */}
        {latest && (
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {latest.weight && (
              <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  <FaBalanceScale className='mr-1 inline' />
                  Weight
                </p>
                <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
                  {latest.weight} kg
                </p>
              </div>
            )}
            {latest.height && (
              <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  <FaRulerVertical className='mr-1 inline' />
                  Height
                </p>
                <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
                  {latest.height} cm
                </p>
              </div>
            )}
            {latest.chest && (
              <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Chest
                </p>
                <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
                  {latest.chest} cm
                </p>
              </div>
            )}
            {latest.waist && (
              <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Waist
                </p>
                <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
                  {latest.waist} cm
                </p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white'>
            <FaHistory className='text-blue-500' />
            Measurement History
          </h3>

          {history.length === 0 ?
            <p className='text-center text-slate-500'>No history available.</p>
          : <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                  <tr>
                    <th className='px-3 py-2 text-left'>Date</th>
                    <th className='px-3 py-2 text-left'>Wt (kg)</th>
                    <th className='px-3 py-2 text-left'>Ht (cm)</th>
                    <th className='px-3 py-2 text-left'>Chest</th>
                    <th className='px-3 py-2 text-left'>Waist</th>
                    <th className='px-3 py-2 text-left'>Hips</th>
                    <th className='px-3 py-2 text-left'>Biceps</th>
                    <th className='px-3 py-2 text-left'>Thighs</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                  {history.map((rec, idx) => (
                    <tr
                      key={idx}
                      className='hover:bg-slate-50 dark:hover:bg-slate-800/50'>
                      <td className='px-3 py-2 text-slate-900 dark:text-white'>
                        {new Date(rec.date).toLocaleDateString()}
                      </td>
                      <td className='px-3 py-2 font-semibold text-slate-900 dark:text-white'>
                        {rec.weight || "-"}
                      </td>
                      <td className='px-3 py-2 text-slate-600 dark:text-slate-300'>
                        {rec.height || "-"}
                      </td>
                      <td className='px-3 py-2 text-slate-600 dark:text-slate-300'>
                        {rec.chest || "-"}
                      </td>
                      <td className='px-3 py-2 text-slate-600 dark:text-slate-300'>
                        {rec.waist || "-"}
                      </td>
                      <td className='px-3 py-2 text-slate-600 dark:text-slate-300'>
                        {rec.hips || "-"}
                      </td>
                      <td className='px-3 py-2 text-slate-600 dark:text-slate-300'>
                        {rec.biceps || "-"}
                      </td>
                      <td className='px-3 py-2 text-slate-600 dark:text-slate-300'>
                        {rec.thighs || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900'>
              <h3 className='mb-4 text-lg font-bold text-slate-900 dark:text-white'>
                Log Measurements
              </h3>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Weight (kg)
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      name='weight'
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Height (cm)
                    </label>
                    <input
                      type='number'
                      name='height'
                      value={formData.height}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Chest (cm)
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      name='chest'
                      value={formData.chest}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Waist (cm)
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      name='waist'
                      value={formData.waist}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Hips (cm)
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      name='hips'
                      value={formData.hips}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Biceps (cm)
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      name='biceps'
                      value={formData.biceps}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Thighs (cm)
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      name='thighs'
                      value={formData.thighs}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Date
                    </label>
                    <input
                      type='date'
                      name='date'
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                </div>
                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={() => setShowForm(false)}
                    className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={saving}
                    className='flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 text-white transition hover:bg-orange-600 disabled:opacity-50'>
                    <FaSave size={14} />
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

export default ProgressMeasurements;
