import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaComments,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCheck,
} from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctor");

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [consultationMode, setConsultationMode] = useState("video");
  const [planType, setPlanType] = useState("single");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const plans = [
    { id: "single", name: "Single Consultation", price: 499, sessions: 1 },
    { id: "monthly", name: "Monthly Plan", price: 999, sessions: 4 },
    { id: "quarterly", name: "Quarterly Plan", price: 2499, sessions: 12 },
  ];

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;
      try {
        const res = await API.get(`/doctors/${doctorId}`);
        setDoctor(res.data.data);
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select date and time");
      return;
    }

    setBooking(true);
    try {
      await API.post("doctor/appointments", {
        doctorId,
        date: selectedDate,
        time: selectedSlot,
        mode: consultationMode,
        planType,
      });
      setSuccess(true);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-950'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-950'>
        <div className='max-w-md rounded-2xl border border-green-500/30 bg-slate-900 p-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-3xl text-green-400'>
            <FaCheck />
          </div>
          <h2 className='mb-2 text-2xl font-bold text-white'>
            Appointment Booked!
          </h2>
          <p className='mb-6 text-slate-300'>
            Your appointment with Dr. {doctor?.name} is confirmed.
          </p>
          <Link
            to='/notifications'
            className='rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition'>
            View in Notifications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950  md:p-8'>
        <div className='mx-auto max-w-4xl'>
          <h1 className='mb-8 text-3xl font-bold text-white'>
            Book Appointment
          </h1>

          {!doctor ?
            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center'>
              <p className='text-slate-400'>
                Doctor not found. Please select a doctor from the directory.
              </p>
              <Link
                to='/doctors'
                className='mt-4 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600'>
                Browse Doctors
              </Link>
            </div>
          : <div className='grid gap-8 md:grid-cols-3'>
              {/* Doctor Summary */}
              <div className='md:col-span-1'>
                <div className='sticky top-8 rounded-2xl border border-slate-700 bg-slate-900 p-6'>
                  <div className='flex items-center gap-4'>
                    <div className='h-16 w-16 rounded-xl bg-slate-800'>
                      {doctor.photo ?
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className='h-full w-full rounded-xl object-cover'
                        />
                      : <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white'>
                          {doctor.name?.charAt(0)}
                        </div>
                      }
                    </div>
                    <div>
                      <h3 className='font-bold text-white'>
                        Dr. {doctor.name}
                      </h3>
                      <p className='text-blue-400'>{doctor.specialty}</p>
                      <div className='mt-1 flex items-center gap-1 text-sm text-yellow-400'>
                        ★ {doctor.rating || "4.8"}
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 border-t border-slate-700 pt-4'>
                    <div className='flex items-center gap-2 text-sm text-slate-300'>
                      <FaMapMarkerAlt className='text-slate-500' />
                      {doctor.location || "Online"}
                    </div>
                    <div className='mt-2 flex items-center gap-2 text-sm text-slate-300'>
                      <FaClock className='text-slate-500' />
                      {doctor.experience} years exp.
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className='md:col-span-2'>
                <div className='rounded-2xl border border-slate-700 bg-slate-900 p-6'>
                  <h2 className='mb-6 text-xl font-bold text-white'>
                    Select Plan
                  </h2>
                  <div className='mb-6 grid gap-4 md:grid-cols-3'>
                    {plans.map((plan) => (
                      <label
                        key={plan.id}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                          planType === plan.id ?
                            "border-orange-500 bg-orange-500/10"
                          : "border-slate-700 bg-slate-800 hover:border-slate-600"
                        }`}>
                        <input
                          type='radio'
                          name='plan'
                          value={plan.id}
                          checked={planType === plan.id}
                          onChange={(e) => setPlanType(e.target.value)}
                          className='sr-only'
                        />
                        <div className='flex items-center justify-between'>
                          <span className='font-semibold text-white'>
                            {plan.name}
                          </span>
                          {planType === plan.id && (
                            <FaCheck className='text-orange-400' />
                          )}
                        </div>
                        <div className='my-2 flex items-baseline gap-1'>
                          <FaRupeeSign className='text-orange-400' />
                          <span className='text-2xl font-bold text-white'>
                            {plan.price}
                          </span>
                        </div>
                        <p className='text-xs text-slate-400'>
                          {plan.sessions} session{plan.sessions > 1 ? "s" : ""}
                        </p>
                      </label>
                    ))}
                  </div>

                  <h2 className='mb-4 text-xl font-bold text-white'>
                    Consultation Mode
                  </h2>
                  <div className='mb-6 flex gap-4'>
                    <label
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 p-4 transition ${
                        consultationMode === "video" ?
                          "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 hover:border-slate-600"
                      }`}>
                      <input
                        type='radio'
                        name='mode'
                        value='video'
                        checked={consultationMode === "video"}
                        onChange={(e) => setConsultationMode(e.target.value)}
                        className='sr-only'
                      />
                      <FaVideo
                        className={
                          consultationMode === "video" ? "text-blue-400" : (
                            "text-slate-500"
                          )
                        }
                      />
                      <span
                        className={
                          consultationMode === "video" ?
                            "font-semibold text-white"
                          : "text-slate-400"
                        }>
                        Video Call
                      </span>
                    </label>
                    <label
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 p-4 transition ${
                        consultationMode === "chat" ?
                          "border-green-500 bg-green-500/10"
                        : "border-slate-700 hover:border-slate-600"
                      }`}>
                      <input
                        type='radio'
                        name='mode'
                        value='chat'
                        checked={consultationMode === "chat"}
                        onChange={(e) => setConsultationMode(e.target.value)}
                        className='sr-only'
                      />
                      <FaComments
                        className={
                          consultationMode === "chat" ? "text-green-400" : (
                            "text-slate-500"
                          )
                        }
                      />
                      <span
                        className={
                          consultationMode === "chat" ?
                            "font-semibold text-white"
                          : "text-slate-400"
                        }>
                        Chat
                      </span>
                    </label>
                    <label
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 p-4 transition ${
                        consultationMode === "in_person" ?
                          "border-purple-500 bg-purple-500/10"
                        : "border-slate-700 hover:border-slate-600"
                      }`}>
                      <input
                        type='radio'
                        name='mode'
                        value='in_person'
                        checked={consultationMode === "in_person"}
                        onChange={(e) => setConsultationMode(e.target.value)}
                        className='sr-only'
                      />
                      <FaMapMarkerAlt
                        className={
                          consultationMode === "in_person" ? "text-purple-400"
                          : "text-slate-500"
                        }
                      />
                      <span
                        className={
                          consultationMode === "in_person" ?
                            "font-semibold text-white"
                          : "text-slate-400"
                        }>
                        In-Person
                      </span>
                    </label>
                  </div>

                  <h2 className='mb-4 text-xl font-bold text-white'>
                    Select Date & Time
                  </h2>
                  <div className='mb-6'>
                    <label className='mb-2 block text-sm text-slate-400'>
                      Date
                    </label>
                    <input
                      type='date'
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className='w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                    />
                  </div>

                  <div className='mb-8'>
                    <label className='mb-2 block text-sm text-slate-400'>
                      Available Slots
                    </label>
                    <div className='grid grid-cols-4 gap-2'>
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg py-2 text-sm transition ${
                            selectedSlot === slot ?
                              "bg-orange-500 text-white"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='rounded-xl border border-slate-700 bg-slate-800 p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-slate-400'>Total Amount</p>
                        <p className='text-2xl font-bold text-white'>
                          ₹{plans.find((p) => p.id === planType)?.price || 0}
                        </p>
                      </div>
                      <button
                        onClick={handleBooking}
                        disabled={booking}
                        className='rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition'>
                        {booking ? "Booking..." : "Confirm Booking"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
