import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaStickyNote,
  FaUserMd,
  FaClipboardList,
} from "react-icons/fa";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const DoctorFollowUps = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    patientId: searchParams.get("patientId") || "",
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, plansRes] = await Promise.all([
          API.get(API_ENDPOINTS.DOCTORS.PATIENTS),
          API.get(API_ENDPOINTS.DOCTORS.FOLLOW_UPS),
        ]);

        setPatients(patientsRes.data.data || []);
        setPlans(plansRes.data.data || []);
      } catch (err) {
        console.error("Failed to load follow-ups:", err);
        if (err.response?.status !== 404) {
          setError(
            err.response?.data?.message || "Failed to load follow-up plans",
          );
        }
        setPlans([
          {
            _id: "demo-1",
            patientName: "John Doe",
            title: "Post-consultation check",
            dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
            status: "pending",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const term = searchTerm.toLowerCase();
    return (
      plan.patientName?.toLowerCase().includes(term) ||
      plan.title?.toLowerCase().includes(term) ||
      plan.description?.toLowerCase().includes(term)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.title || !form.dueDate) {
      setError("Please complete patient, title and due date.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        patientId: form.patientId,
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
        status: form.status,
      };
      await API.post(API_ENDPOINTS.DOCTORS.FOLLOW_UPS, payload);
      setPlans((prev) => [
        {
          _id: `local-${Date.now()}`,
          patientName: patients.find((p) => p._id === form.patientId)?.name,
          ...payload,
        },
        ...prev,
      ]);
      setForm({
        patientId: form.patientId,
        title: "",
        description: "",
        dueDate: "",
        status: "pending",
      });
      setError(null);
    } catch (err) {
      console.error("Failed to save follow-up:", err);
      setError(err.response?.data?.message || "Unable to save follow-up plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950 p-4 md:p-8'>
        <div className='mx-auto max-w-6xl space-y-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <button
                onClick={() => navigate("/doctor")}
                className='mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-orange-500 hover:text-white'>
                <FaArrowLeft /> Back to Dashboard
              </button>
              <h1 className='text-3xl font-bold text-white'>Follow-up Plans</h1>
              <p className='text-slate-400'>
                Create care reminders and follow-up tasks for patients.
              </p>
            </div>
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className='rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600'>
              <FaPlus /> {showForm ? "Hide Form" : "New Follow-up"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className='rounded-3xl border border-slate-700 bg-slate-900 p-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-300'>
                    Patient
                  </label>
                  <select
                    value={form.patientId}
                    onChange={(e) =>
                      setForm({ ...form, patientId: e.target.value })
                    }
                    className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'>
                    <option value=''>Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name || patient.email || patient._id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-300'>
                    Due Date
                  </label>
                  <input
                    type='date'
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                    className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                  />
                </div>
              </div>

              <div className='mt-6 space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-300'>
                    Plan Title
                  </label>
                  <input
                    type='text'
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder='Follow-up plan title'
                    className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-300'>
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={4}
                    placeholder='Describe the follow-up or care plan details'
                    className='w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-300'>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'>
                    <option value='pending'>Pending</option>
                    <option value='active'>Active</option>
                    <option value='completed'>Completed</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className='mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300'>
                  {error}
                </div>
              )}

              <div className='mt-6 flex flex-wrap gap-3'>
                <button
                  type='submit'
                  disabled={saving}
                  className='rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60'>
                  <FaClipboardList /> Save Follow-up
                </button>
                <button
                  type='button'
                  onClick={() =>
                    setForm({
                      ...form,
                      title: "",
                      description: "",
                      dueDate: "",
                      status: "pending",
                    })
                  }
                  className='rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition hover:border-orange-500'>
                  Clear
                </button>
              </div>
            </form>
          )}

          <div className='rounded-3xl border border-slate-700 bg-slate-900 p-6'>
            <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-bold text-white'>
                  Follow-up Plans
                </h2>
                <p className='text-slate-400'>
                  Track reminders and care plans across patients.
                </p>
              </div>
              <div className='relative'>
                <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search by patient, title, description'
                  className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-12 py-3 text-white focus:border-orange-500 focus:outline-none md:w-96'
                />
              </div>
            </div>

            {loading ?
              <div className='flex items-center justify-center py-16'>
                <div className='h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent' />
              </div>
            : filteredPlans.length > 0 ?
              <div className='grid gap-4 lg:grid-cols-2'>
                {filteredPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className='rounded-3xl border border-slate-700 bg-slate-950 p-5'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <div>
                        <p className='text-sm font-semibold text-slate-400'>
                          Patient
                        </p>
                        <p className='text-lg font-bold text-white'>
                          {plan.patientName}
                        </p>
                      </div>
                      <span className='rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300'>
                        {plan.status}
                      </span>
                    </div>
                    <h3 className='text-xl font-semibold text-white'>
                      {plan.title}
                    </h3>
                    <p className='mt-2 text-slate-400'>
                      {plan.description || "No description provided."}
                    </p>
                    <div className='mt-4 flex flex-wrap gap-2 text-sm text-slate-400'>
                      <span className='inline-flex items-center gap-2'>
                        <FaCalendarAlt />
                        {new Date(plan.dueDate).toLocaleDateString()}
                      </span>
                      <span className='inline-flex items-center gap-2'>
                        <FaUserMd />
                        {plan.patientName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            : <div className='rounded-3xl border border-dashed border-slate-700 p-12 text-center text-slate-400'>
                <FaStickyNote className='mx-auto mb-4 text-5xl text-slate-600' />
                <p>No follow-up plans found.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className='mt-4 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600'>
                  Create your first follow-up
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorFollowUps;
