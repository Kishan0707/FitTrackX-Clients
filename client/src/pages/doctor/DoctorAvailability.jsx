import { useContext, useEffect, useState } from "react";
import { FaCalendarAlt, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const WEEK_DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const DoctorAvailability = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [availability, setAvailability] = useState({
    monday: { enabled: false, slots: [] },
    tuesday: { enabled: false, slots: [] },
    wednesday: { enabled: false, slots: [] },
    thursday: { enabled: false, slots: [] },
    friday: { enabled: false, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
    breakDuration: 15,
    maxAppointmentsPerDay: 10,
  });

  useEffect(() => {
    if (!user) return;

    const fetchAvailability = async () => {
      try {
        const res = await API.get("/doctor/availability");
        console.log("Fetched availability:", res.data);
        if (res.data.data) {
          setAvailability(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user]);

  const toggleDay = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const toggleTimeSlot = (day, time) => {
    setAvailability((prev) => {
      const currentSlots = prev[day].slots || [];
      const newSlots =
        currentSlots.includes(time) ?
          currentSlots.filter((t) => t !== time)
        : [...currentSlots, time].sort();
      return {
        ...prev,
        [day]: { ...prev[day], slots: newSlots },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    try {
      await API.put("/doctor/availability", availability);
      setSuccess("Availability updated successfully!");
      window.dispatchEvent(new Event("availability-updated"));
    } catch (error) {
      console.error("Failed to update availability:", error);
      setError(
        error.response?.data?.message || "Failed to update availability",
      );
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
              Availability
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Set your weekly working hours and break duration
            </p>
          </div>
        </div>

        {success && (
          <div className='rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400'>
            {success}
          </div>
        )}

        {error && (
          <div className='rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
            {/* Global Settings */}
            <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                  Break Duration (minutes)
                </label>
                <select
                  name='breakDuration'
                  value={availability.breakDuration}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      breakDuration: Number(e.target.value),
                    }))
                  }
                  className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'>
                  <option value='15'>15 minutes</option>
                  <option value='30'>30 minutes</option>
                  <option value='45'>45 minutes</option>
                  <option value='60'>60 minutes</option>
                </select>
              </div>
              <div>
                <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                  Max Appointments Per Day
                </label>
                <input
                  type='number'
                  name='maxAppointmentsPerDay'
                  value={availability.maxAppointmentsPerDay}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      maxAppointmentsPerDay: Number(e.target.value),
                    }))
                  }
                  min='1'
                  max='50'
                  className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                />
              </div>
            </div>

            {/* Days */}
            <div className='space-y-6'>
              {WEEK_DAYS.map(({ key, label }) => (
                <div
                  key={key}
                  className='rounded-xl border border-slate-200 p-4 dark:border-slate-800'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <button
                        type='button'
                        onClick={() => toggleDay(key)}
                        className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
                          availability[key].enabled ?
                            "bg-green-500"
                          : "bg-slate-300 dark:bg-slate-700"
                        }`}>
                        <div
                          className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                            availability[key].enabled ?
                              "translate-x-5"
                            : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className='font-semibold text-slate-900 dark:text-white'>
                        {label}
                      </span>
                    </div>
                    {availability[key].enabled && (
                      <span className='text-xs text-green-600 dark:text-green-400'>
                        {availability[key].slots.length} slot(s) selected
                      </span>
                    )}
                  </div>

                  {availability[key].enabled && (
                    <div className='mt-3 flex flex-wrap gap-2'>
                      {TIME_SLOTS.map((time) => {
                        const isSelected =
                          availability[key].slots.includes(time);
                        return (
                          <button
                            key={time}
                            type='button'
                            onClick={() => toggleTimeSlot(key, time)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                              isSelected ?
                                "bg-blue-500 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            }`}>
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className='mt-6 flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => window.location.reload()}
                className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                Reset
              </button>
              <button
                type='submit'
                disabled={saving}
                className='flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 text-white transition hover:bg-orange-600 disabled:opacity-50'>
                <FaCheck size={14} />
                {saving ? "Saving..." : "Save Availability"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAvailability;
