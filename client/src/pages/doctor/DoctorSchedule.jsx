import { useContext, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const DoctorSchedule = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [formData, setFormData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "13:00",
    breakEnd: "14:00",
    maxAppointments: 10,
    notes: "",
  });

useEffect(() => {
     if (!user) return;

     const fetchSchedules = async () => {
       try {
         const res = await API.get("/doctor/schedule");
         setSchedules(Array.isArray(res.data.data) ? res.data.data : []);
       } catch (error) {
         console.error("Failed to fetch schedules:", error);
         setSchedules([]);
       } finally {
         setLoading(false);
       }
     };

     fetchSchedules();
   }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingSchedule) {
        await API.put(`/doctor/schedule/${editingSchedule._id}`, formData);
      } else {
        await API.post("/doctor/schedule", formData);
      }

      setShowModal(false);
      setEditingSchedule(null);
      setFormData({
        date: "",
        startTime: "09:00",
        endTime: "17:00",
        breakStart: "13:00",
        breakEnd: "14:00",
        maxAppointments: 10,
        notes: "",
      });

// Refresh schedules
      const res = await API.get("/doctor/schedule");
      setSchedules(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await API.delete(`/doctor/schedule/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete");
    }
  };

  const openEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakStart: schedule.breakStart,
      breakEnd: schedule.breakEnd,
      maxAppointments: schedule.maxAppointments,
      notes: schedule.notes || "",
    });
    setShowModal(true);
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
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
              Schedule
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Manage your working hours and appointment slots
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSchedule(null);
              setFormData({
                date: "",
                startTime: "09:00",
                endTime: "17:00",
                breakStart: "13:00",
                breakEnd: "14:00",
                maxAppointments: 10,
                notes: "",
              });
              setShowModal(true);
            }}
            className='flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600'>
            <FaPlus size={14} />
            Add Schedule
          </button>
        </div>

        {/* Schedule List */}
        {showModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
                  {editingSchedule ? "Edit Schedule" : "Add Schedule"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className='text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'>
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Date
                    </label>
                    <input
                      type='date'
                      name='date'
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Max Appointments
                    </label>
                    <input
                      type='number'
                      name='maxAppointments'
                      value={formData.maxAppointments}
                      onChange={handleInputChange}
                      min='1'
                      max='50'
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Start Time
                    </label>
                    <input
                      type='time'
                      name='startTime'
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      End Time
                    </label>
                    <input
                      type='time'
                      name='endTime'
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Break Start
                    </label>
                    <input
                      type='time'
                      name='breakStart'
                      value={formData.breakStart}
                      onChange={handleInputChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Break End
                    </label>
                    <input
                      type='time'
                      name='breakEnd'
                      value={formData.breakEnd}
                      onChange={handleInputChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Notes (optional)
                  </label>
                  <textarea
                    name='notes'
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows='2'
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  />
                </div>

                <div className='flex justify-end gap-3 pt-4'>
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

        {/* Schedules Table */}
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='border-b border-slate-200 p-4 dark:border-slate-800'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
              Your Schedules
            </h3>
          </div>

          {schedules.length === 0 ? (
            <div className='p-8 text-center text-slate-500 dark:text-slate-400'>
              <FaCalendarAlt className='mx-auto mb-2 text-3xl' />
              <p>No schedules added yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className='mt-2 text-orange-500 hover:underline'>
                Add your first schedule
              </button>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                  <tr>
                    <th className='px-4 py-3 text-left'>Date</th>
                    <th className='px-4 py-3 text-left'>Hours</th>
                    <th className='px-4 py-3 text-left'>Break</th>
                    <th className='px-4 py-3 text-left'>Max</th>
                    <th className='px-4 py-3 text-left'>Notes</th>
                    <th className='px-4 py-3 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule._id}
                      className='hover:bg-slate-50 dark:hover:bg-slate-800/50'>
                      <td className='px-4 py-3 text-slate-900 dark:text-white'>
                        {new Date(schedule.date).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                        {schedule.startTime} - {schedule.endTime}
                      </td>
                      <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                        {schedule.breakStart} - {schedule.breakEnd}
                      </td>
                      <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                        {schedule.maxAppointments}
                      </td>
                      <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                        {schedule.notes || "-"}
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <div className='flex justify-end gap-2'>
                          <button
                            onClick={() => openEdit(schedule)}
                            className='rounded-lg p-2 text-blue-500 hover:bg-blue-500/10 transition'>
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className='rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition'>
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSchedule;
