import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaStethoscope,
  FaCertificate,
  FaStar,
  FaEdit,
  FaSave,
  FaTimes,
  FaBriefcase,
  FaGraduationCap,
  FaAward,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const DoctorProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    specialty: "",
    licenseNumber: "",
    experience: 0,
    qualifications: "",
    hospital: "",
    about: "",
    consultationFee: 0,
    availableDays: [],
    timeSlots: [],
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/doctor/profile");
        const data = res.data.data;

        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          specialty: data.specialty || "",
          licenseNumber: data.licenseNumber || "",
          experience: data.experience || 0,
          qualifications: data.qualifications || "",
          hospital: data.hospital || "",
          about: data.about || "",
          consultationFee: data.consultationFee || 0,
          availableDays: data.availableDays || [],
          timeSlots: data.timeSlots || [],
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked
        : type === "number" ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess("");

    try {
      await API.put("/doctor/profile", formData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Refresh user data
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
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
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
              Doctor Profile
            </h1>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              Manage your professional information and availability
            </p>
          </div>
          {!isEditing ?
            <button
              onClick={() => setIsEditing(true)}
              className='flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600'>
              <FaEdit size={14} />
              Edit Profile
            </button>
          : <div className='flex gap-2'>
              <button
                onClick={() => setIsEditing(false)}
                className='flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'>
                <FaTimes size={14} />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50'>
                <FaSave size={14} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          }
        </div>

        {error && (
          <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200'>
            {error}
          </div>
        )}

        {success && (
          <div className='rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-green-200'>
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <div className='flex flex-col gap-6 md:flex-row'>
            {/* Left: Avatar & Basic */}
            <div className='flex flex-1 flex-col items-center gap-4 md:items-start'>
              <div className='h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-5xl font-bold text-white shadow-lg'>
                {formData.name?.charAt(0) || "D"}
              </div>
              <div className='text-center md:text-left'>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>
                  {formData.name || "Doctor Name"}
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  {formData.specialty || "Specialty"}
                </p>
                {formData.hospital && (
                  <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                    <FaBriefcase className='mr-1 inline' />
                    {formData.hospital}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Key Details */}
            <div className='flex-1 space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                    Email
                  </label>
                  {isEditing ?
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  : <p className='mt-1 text-slate-900 dark:text-white'>
                      {formData.email}
                    </p>
                  }
                </div>

                <div>
                  <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                    Phone
                  </label>
                  {isEditing ?
                    <input
                      type='tel'
                      name='phone'
                      value={formData.phone}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  : <p className='mt-1 text-slate-900 dark:text-white'>
                      {formData.phone || "Not set"}
                    </p>
                  }
                </div>

                <div>
                  <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                    License Number
                  </label>
                  {isEditing ?
                    <input
                      type='text'
                      name='licenseNumber'
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  : <p className='mt-1 text-slate-900 dark:text-white'>
                      {formData.licenseNumber || "Not set"}
                    </p>
                  }
                </div>

                <div>
                  <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                    Experience (Years)
                  </label>
                  {isEditing ?
                    <input
                      type='number'
                      name='experience'
                      value={formData.experience}
                      onChange={handleChange}
                      min='0'
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  : <p className='mt-1 text-slate-900 dark:text-white'>
                      {formData.experience} years
                    </p>
                  }
                </div>

                <div className='md:col-span-2'>
                  <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                    Consultation Fee
                  </label>
                  {isEditing ?
                    <div className='mt-1 flex items-center gap-2'>
                      <span className='text-slate-500'>₹</span>
                      <input
                        type='number'
                        name='consultationFee'
                        value={formData.consultationFee}
                        onChange={handleChange}
                        min='0'
                        className='w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                      />
                    </div>
                  : <p className='mt-1 text-slate-900 dark:text-white'>
                      {formData.consultationFee > 0 ?
                        `₹${formData.consultationFee}`
                      : "Not set"}
                    </p>
                  }
                </div>

                <div className='md:col-span-2'>
                  <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                    Address
                  </label>
                  {isEditing ?
                    <textarea
                      name='address'
                      value={formData.address}
                      onChange={handleChange}
                      rows='2'
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    />
                  : <p className='mt-1 text-slate-900 dark:text-white'>
                      {formData.address || "Not set"}
                    </p>
                  }
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                  Qualifications
                </label>
                {isEditing ?
                  <textarea
                    name='qualifications'
                    value={formData.qualifications}
                    onChange={handleChange}
                    rows='3'
                    placeholder='MBBS, MD, etc.'
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  />
                : <p className='mt-1 whitespace-pre-wrap text-slate-900 dark:text-white'>
                    {formData.qualifications || "Not set"}
                  </p>
                }
              </div>

              {/* About */}
              <div>
                <label className='text-xs font-semibold uppercase text-slate-500 dark:text-slate-400'>
                  About
                </label>
                {isEditing ?
                  <textarea
                    name='about'
                    value={formData.about}
                    onChange={handleChange}
                    rows='4'
                    placeholder='A brief introduction about your practice...'
                    className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  />
                : <p className='mt-1 whitespace-pre-wrap text-slate-900 dark:text-white'>
                    {formData.about || "No description provided."}
                  </p>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Patients
            </p>
            <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
              {/* <!-- TODO: fetch from API --> */}
              --
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Appointments
            </p>
            <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
              --
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Earnings
            </p>
            <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
              --
            </p>
          </div>
          <div className='rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>Rating</p>
            <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>
              --
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
