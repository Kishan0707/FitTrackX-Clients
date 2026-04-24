import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaUserMd,
  FaCalendarAlt,
  FaFileMedical,
  FaPrescription,
  FaComments,
  FaVideo,
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
  FaRupeeSign,
  FaClock,
  FaStethoscope,
} from "react-icons/fa";
import { MdEmail, MdAccessTime } from "react-icons/md";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import DashboardLayout from "../../layout/DashboardLayout";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("premium");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await API.get(API_ENDPOINTS.DOCTORS.DETAIL(doctorId));
        setDoctor(res.data.data);
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
      </div>
    );
  }

  if (!doctor) {
    return <div className='p-8 text-center text-red-400'>Doctor not found</div>;
  }

  const plans = [
    {
      id: "basic",
      name: "Basic Consult",
      price: 499,
      features: ["1 Consultation", "Chat Support", "7 Days Access"],
      popular: false,
    },
    {
      id: "premium",
      name: "Monthly Follow-up",
      price: 999,
      features: [
        "4 Consultations",
        "Priority Chat",
        "30 Days Access",
        " prescriptions Included",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Full Care Plan",
      price: 2999,
      features: [
        "Unlimited Consultations",
        "24/7 Chat",
        "90 Days Access",
        "Lab Report Review",
        "Medication Management",
      ],
      popular: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950 p-4 md:p-8'>
        <div className='mx-auto max-w-6xl'>
          {/* Doctor Header */}
          <div className='mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl'>
            <div className='relative h-32 bg-gradient-to-r from-blue-600 to-purple-600 md:h-48'>
              <div className='absolute -bottom-12 left-8'>
                <div className='h-24 w-24 rounded-full bg-slate-200 object-cover md:h-32 md:w-32'>
                  {doctor.photo ?
                    <img
                      src={doctor.photo}
                      alt={doctor.name}
                      className='h-full w-full rounded-2xl object-cover'
                    />
                  : <div className='flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white'>
                      {doctor.name?.charAt(0)}
                    </div>
                  }
                </div>
              </div>
            </div>

            <div className='pt-16 pb-8 pl-8 pr-8 md:pl-40'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div>
                  <h1 className='text-2xl font-bold text-white md:text-3xl'>
                    Dr. {doctor.name}
                  </h1>
                  <p className='mt-1 text-blue-400'>
                    {doctor.specialty || "General Physician"}
                  </p>
                  <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400'>
                    {doctor.experience && (
                      <span className='flex items-center gap-1'>
                        <FaStethoscope className='text-blue-400' />
                        {doctor.experience} years exp.
                      </span>
                    )}
                    {doctor.rating && (
                      <span className='flex items-center gap-1'>
                        <FaStar className='text-yellow-400' />
                        {doctor.rating} ({doctor.reviewCount || 0} reviews)
                      </span>
                    )}
                    {doctor.location && (
                      <span className='flex items-center gap-1'>
                        <FaMapMarkerAlt className='text-red-400' />
                        {doctor.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex gap-2'>
                  <button className='rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 transition'>
                    <FaVideo className='mr-2 inline' /> Video Consult
                  </button>
                  <button className='rounded-xl border border-slate-600 bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition'>
                    <FaComments className='mr-2 inline' /> Chat
                  </button>
                </div>
              </div>

              {/* Doctor Details */}
              <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {doctor.phone && (
                  <div className='flex items-center gap-3 text-slate-300'>
                    <FaPhone className='text-green-400' />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                {doctor.email && (
                  <div className='flex items-center gap-3 text-slate-300'>
                    <MdEmail className='text-blue-400' />
                    <span>{doctor.email}</span>
                  </div>
                )}
                {doctor.address && (
                  <div className='flex items-center gap-3 text-slate-300'>
                    <FaMapMarkerAlt className='text-red-400' />
                    <span>{doctor.address}</span>
                  </div>
                )}
                {doctor.availability && (
                  <div className='flex items-center gap-3 text-slate-300'>
                    <FaClock className='text-orange-400' />
                    <span>{doctor.availability}</span>
                  </div>
                )}
              </div>

              {/* Qualifications */}
              {doctor.qualifications && (
                <div className='mt-6'>
                  <h3 className='mb-2 font-semibold text-white'>
                    Qualifications
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {doctor.qualifications.map((qual, idx) => (
                      <span
                        key={idx}
                        className='rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300'>
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {doctor.services && (
                <div className='mt-4'>
                  <h3 className='mb-2 font-semibold text-white'>Services</h3>
                  <div className='flex flex-wrap gap-2'>
                    {doctor.services.map((service, idx) => (
                      <span
                        key={idx}
                        className='rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-300'>
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Plans */}
          <div className='mb-8'>
            <h2 className='mb-4 text-xl font-bold text-white'>Select a Plan</h2>
            <div className='grid gap-4 md:grid-cols-3'>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative cursor-pointer rounded-2xl border-2 p-6 transition ${
                    selectedPlan === plan.id ?
                      "border-orange-500 bg-orange-500/10"
                    : "border-slate-700 bg-slate-900 hover:border-slate-600"
                  } ${plan.popular ? "ring-2 ring-orange-500/50" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}>
                  {plan.popular && (
                    <span className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white'>
                      Most Popular
                    </span>
                  )}
                  <h3 className='text-lg font-bold text-white'>{plan.name}</h3>
                  <div className='my-4 flex items-baseline gap-1'>
                    <FaRupeeSign className='text-2xl text-orange-400' />
                    <span className='text-3xl font-bold text-white'>
                      {plan.price}
                    </span>
                    <span className='text-slate-400'>
                      / {plan.id === "basic" ? "consult" : "month"}
                    </span>
                  </div>
                  <ul className='space-y-2'>
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className='flex items-center gap-2 text-sm text-slate-300'>
                        <span className='text-green-400'>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Availability */}
          <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
            <h2 className='mb-4 text-xl font-bold text-white'>Availability</h2>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-xl border border-slate-700 p-4'>
                <div className='flex items-center gap-3'>
                  <FaCalendarAlt className='text-blue-400 text-xl' />
                  <div>
                    <p className='font-semibold text-white'>Mon - Fri</p>
                    <p className='text-sm text-slate-400'>9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
              <div className='rounded-xl border border-slate-700 p-4'>
                <div className='flex items-center gap-3'>
                  <FaCalendarAlt className='text-green-400 text-xl' />
                  <div>
                    <p className='font-semibold text-white'>Saturday</p>
                    <p className='text-sm text-slate-400'>10:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
              <div className='rounded-xl border border-slate-700 p-4'>
                <div className='flex items-center gap-3'>
                  <FaCalendarAlt className='text-red-400 text-xl' />
                  <div>
                    <p className='font-semibold text-white'>Sunday</p>
                    <p className='text-sm text-slate-400'>Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <button className='mt-6 w-full rounded-xl bg-orange-500 py-4 font-semibold text-white hover:bg-orange-600 transition'>
              Book Appointment - ₹
              {selectedPlan === "basic" ?
                499
              : selectedPlan === "premium" ?
                999
              : 2999}
            </button>
          </div>

          {/* About Section */}
          {doctor.about && (
            <div className='mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6'>
              <h2 className='mb-4 text-xl font-bold text-white'>About</h2>
              <p className='leading-relaxed text-slate-300'>{doctor.about}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
