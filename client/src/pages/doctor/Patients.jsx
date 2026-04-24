import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import { FaUser, FaSearch, FaTrash } from "react-icons/fa";
import { RiUserAddLine } from "react-icons/ri";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchPatients = async (searchTerm = "") => {
    try {
      const res = await API.get(
        `${API_ENDPOINTS.DOCTORS.PATIENTS}?search=${searchTerm}`,
      );
      setPatients(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.response?.data?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchPatients(value);
  };

  const handleRemovePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to remove this patient?"))
      return;

    try {
      await API.delete(`${API_ENDPOINTS.DOCTORS.PATIENTS}/${patientId}`);
      alert("Patient removed successfully");
      fetchPatients(search);
    } catch (err) {
      console.error("Error removing patient:", err);
      alert("Error removing patient");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex justify-center items-center h-screen'>
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

  return (
    <DashboardLayout>
      <div className='p-4 space-y-6'>
        <h2 className='text-2xl font-bold text-white'>My Patients</h2>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2 flex-1'>
            <FaSearch className='text-slate-400' />
            <input
              type='text'
              placeholder='Search patients...'
              value={search}
              onChange={handleSearch}
              className='rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1'
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className='flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2 font-semibold text-white hover:bg-orange-600 transition'>
            <RiUserAddLine /> Add Patient
          </button>
        </div>

        {/* Add Patient Modal */}
        {showModal && (
          <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
            <div className='bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700'>
              <h2 className='text-xl font-bold text-white mb-4'>
                Add New Patient
              </h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  const formData = new FormData(e.target);
                  const email = formData.get("email");

                  if (!email) {
                    alert("Email is required");
                    return;
                  }

                  try {
                    await API.post(API_ENDPOINTS.DOCTORS.PATIENTS, { email });
                    alert("Patient added successfully ✅");
                    setShowModal(false);
                    fetchPatients(search);
                  } catch (err) {
                    console.error(err);
                    alert(
                      err.response?.data?.message || "Error adding patient",
                    );
                  }
                }}
                className='space-y-4'>
                <input
                  name='email'
                  type='email'
                  placeholder='Patient Email'
                  required
                  className='w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />

                <div className='flex justify-end gap-3 mt-4'>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600'>
                    Cancel
                  </button>

                  <button
                    type='submit'
                    className='px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600'>
                    Add Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {patients?.length === 0 ?
          <div className='text-center py-12'>
            <FaUser className='mx-auto mb-4 text-4xl text-slate-600' />
            <p className='text-slate-400'>No patients yet</p>
            <p className='text-sm text-slate-500 mt-2'>
              Start by adding patients using their email
            </p>
          </div>
        : <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-slate-700'>
                  <th className='pb-3 text-left text-sm font-semibold text-slate-300'>
                    Patient
                  </th>
                  <th className='pb-3 text-left text-sm font-semibold text-slate-300'>
                    Email
                  </th>
                  <th className='pb-3 text-left text-sm font-semibold text-slate-300'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients?.map((patient) => (
                  <tr
                    key={patient._id}
                    className='border-b border-slate-800 hover:bg-slate-800/50 transition'>
                    <td className='py-4 flex items-center gap-3 text-white'>
                      <div className='w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center'>
                        <FaUser className='text-slate-300' />
                      </div>
                      <div>
                        <p className='font-medium'>{patient.name}</p>
                        <p className='text-sm text-slate-400'>
                          Age: {patient.age || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className='py-4 text-slate-300'>{patient.email}</td>
                    <td className='py-4 flex items-center gap-2'>
                      <button
                        onClick={() =>
                          navigate(`/doctor/patient/${patient._id}`)
                        }
                        className='text-blue-400 hover:text-blue-300 hover:underline'>
                        View Profile
                      </button>
                      <button
                        onClick={() => handleRemovePatient(patient._id)}
                        className='text-red-400 hover:text-red-300 hover:underline flex items-center gap-1'>
                        <FaTrash /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </DashboardLayout>
  );
};

export default Patients;
