import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { FaUser } from "react-icons/fa";

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.target);

    const data = {
      name: formData.get("name"),
      age: formData.get("age"),
      condition: formData.get("condition"),
    };

    try {
      await API.post("/doctor/patients", data);
      setSuccess(true);
      // Redirect to patients list after a short delay
      setTimeout(() => {
        navigate("/doctor/patients");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add patient");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='rounded-xl border border-red-500/30 bg-slate-900 p-6 text-center text-red-400'>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-3 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600'>
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className='flex min-h-screen items-center justify-center bg-slate-950'>
          <div className='rounded-xl border border-green-500/30 bg-slate-900 p-6 text-center text-green-400'>
            <p>Patient added successfully! Redirecting...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-white mb-6'>Add New Patient</h2>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>Patient Name</label>
            <input
              type='text'
              name='name'
              required
              className='w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>Age</label>
            <input
              type='number'
              name='age'
              required
              className='w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>Condition</label>
            <input
              type='text'
              name='condition'
              required
              className='w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
          </div>
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={() => navigate("/doctor/patients")}
              className='px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 mr-2'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className={`px-6 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 ${loading && 'opacity-70'}`}>
              {loading ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddPatient;