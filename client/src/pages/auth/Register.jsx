import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import API from "../../services/api";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Register = ({ togglePanel }) => {
  const { register } = useContext(AuthContext);
  const [isDoctor, setIsDoctor] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    role: "user",
    // Doctor fields
    medicalLicense: "",
    specialization: "",
    qualifications: "",
    experience: "",
    location: "",
    phone: "",
    about: "",
    consultationFee: "",
  });

  const [otpStatus, setOtpStatus] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const handleChange = (e) => {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "email") {
      setOtpStatus("");
      setOtpError("");
      setOtpTimer(0);
    }
  };

  useEffect(() => {
    if (otpTimer <= 0) return undefined;
    const interval = setInterval(() => {
      setOtpTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async () => {
    if (!registerFormData.email) {
      setOtpError("Enter your email first");
      return;
    }

    setOtpSending(true);
    setOtpError("");
    setOtpStatus("");
    try {
      const res = await API.post("/auth/send-otp", {
        email: registerFormData.email,
      });
      setOtpStatus(res.data.message || "OTP sent");
      setOtpTimer(res.data.expiresIn || 180);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registerFormData.otp) {
      setError("Please enter the OTP sent to your email");
      return;
    }

    try {
      setLoading(true);
      await register(registerFormData);
      setSuccess("Registration Successful");
      setOtpStatus("");
      setOtpTimer(0);
      setRegisterFormData((prev) => ({ ...prev, otp: "" }));
      if (togglePanel) togglePanel();
    } catch (err) {
      setError(err.response?.data?.message || "Register Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center w-full h-full md:p-5 gap-15 text-white '>
      {error && (
        <div className='bg-red-500 text-white p-2 rounded mb-2 absolute right-10 top-10'>
          {error}
        </div>
      )}
      {success && (
        <div className='bg-green-500 text-white p-2 rounded mb-2 absolute right-10 top-10'>
          {success}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-5 items-center justify-center w-full'>
        <h1 className='text-3xl font-bold text-center mb-3'>Register</h1>

        {/* Role Selection */}
        <div className='w-full flex gap-4'>
          <label
            className={`flex-1 cursor-pointer rounded border-2 p-4 text-center transition w-full ${
              !isDoctor ?
                "border-orange-500 bg-orange-500/10 text-white"
              : "border-slate-700 text-slate-400 hover:border-slate-600"
            }`}>
            <input
              type='radio'
              name='role'
              value='user'
              checked={!isDoctor}
              onChange={() => {
                setIsDoctor(false);
                setRegisterFormData({ ...registerFormData, role: "user" });
              }}
              className='sr-only text-white'
            />
            <div className='text-2xl'>👤</div>
            <div className='mt-2 font-semibold'>User</div>
            <div className='text-xs mt-1'>Track fitness, workouts & diet</div>
          </label>
          <label
            className={`flex-1 cursor-pointer rounded border-2 p-4 text-center transition ${
              isDoctor ?
                "border-orange-500 bg-orange-500/10 text-white"
              : "border-slate-700 text-slate-400 hover:border-slate-600"
            }`}>
            <input
              type='radio'
              name='role'
              value='doctor'
              checked={isDoctor}
              onChange={() => {
                setIsDoctor(true);
                setRegisterFormData({ ...registerFormData, role: "doctor" });
              }}
              className='sr-only'
            />
            <div className='text-2xl'>🩺</div>
            <div className='mt-2 font-semibold'>Doctor</div>
            <div className='text-xs mt-1'>Medical consultations & care</div>
          </label>
        </div>

        {/* Common fields */}
        <div className='relative group flex w-full items-center justify-between gap-3'>
          <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors'>
            <FaLock className='text-lg' />
          </div>
          <input
            type='text'
            placeholder='Full Name'
            name='name'
            onChange={handleChange}
            value={registerFormData.name}
            className='w-full px-12 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
          />
        </div>
        <div className='flex w-full items-center justify-between gap-3 relative group'>
          <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors'>
            <FaEnvelope className='text-lg' />
          </div>
          <input
            type='email'
            placeholder='Email'
            name='email'
            onChange={handleChange}
            value={registerFormData.email}
            className='w-full px-12 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
          />
          <button
            type='button'
            onClick={handleSendOtp}
            disabled={otpSending || otpTimer > 0}
            className={`flex-1 bg-gray-950 px-4 py-3 rounded shadow-lg ring-1 ring-blue-900 hover:bg-gray-900 transition${
              otpSending || otpTimer > 0 ?
                "opacity-60 cursor-not-allowed"
              : "hover:scale-105"
            }`}>
            {otpTimer > 0 ?
              `Resend in ${otpTimer}s`
            : otpSending ?
              "Sending..."
            : "OTP"}
          </button>
        </div>
        <span className='text-xs text-slate-300'>{otpStatus}</span>
        {otpError && <p className='text-xs text-rose-300 w-full'>{otpError}</p>}

        <input
          type='text'
          placeholder='Enter OTP'
          name='otp'
          onChange={handleChange}
          value={registerFormData.otp}
          className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
        />

        <div className='relative flex gap-2 w-full'>
          <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors'>
            <FaLock className='text-lg' />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder='Password'
            name='password'
            onChange={handleChange}
            value={registerFormData.password}
            className='w-full px-12 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='bg-gray-950 px-4 py-1.5 rounded shadow-lg ring-1 ring-blue-900 hover:bg-gray-900 transition'>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Doctor-specific fields */}
        {isDoctor && (
          <div className='w-full space-y-4 rounded border border-slate-700 bg-slate-800/50 p-4'>
            <h3 className='font-semibold text-white'>Doctor Information</h3>
            <input
              type='text'
              placeholder='Medical License Number *'
              name='medicalLicense'
              onChange={handleChange}
              value={registerFormData.medicalLicense}
              required
              className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
            />
            <input
              type='text'
              placeholder='Specialization (e.g., Cardiologist) *'
              name='specialization'
              onChange={handleChange}
              value={registerFormData.specialization}
              required
              className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
            />
            <textarea
              placeholder='Qualifications (degrees, certifications) *'
              name='qualifications'
              onChange={handleChange}
              value={registerFormData.qualifications}
              required
              className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <input
                type='number'
                placeholder='Years of Experience *'
                name='experience'
                onChange={handleChange}
                value={registerFormData.experience}
                required
                className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
              />
              <input
                type='number'
                placeholder='Consultation Fee (₹) *'
                name='consultationFee'
                onChange={handleChange}
                value={registerFormData.consultationFee}
                required
                className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
              />
            </div>
            <input
              type='text'
              placeholder='Clinic/Hospital Address'
              name='location'
              onChange={handleChange}
              value={registerFormData.location}
              className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
            />
            <input
              type='tel'
              placeholder='Phone Number *'
              name='phone'
              onChange={handleChange}
              value={registerFormData.phone}
              required
              className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
            />
            <textarea
              placeholder='About / Bio (describe your practice)'
              name='about'
              onChange={handleChange}
              value={registerFormData.about}
              className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
            />
          </div>
        )}

        <button
          className={`bg-gray-700 hover:bg-gray-800 py-2 rounded transition w-full flex items-center justify-center text-center ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          type='submit'>
          {loading ?
            <div className='w-5 h-5 p-1 border-t border-r border-b rounded-full animate-spin transition-all ease-in-out duration-300'></div>
          : <div className=''>
              {isDoctor ? "Register as Doctor" : "Register"}
            </div>
          }
        </button>

        <p
          className='text-center text-sm cursor-pointer'
          onClick={() => {
            if (togglePanel) togglePanel();
          }}>
          I already have an
          <span
            className='text-blue-500 font-semibold underline'
            onClick={() => {
              togglePanel();
              setIsDoctor(false);
            }}>
            account
          </span>
        </p>
      </form>
      {/* <div className='w-full md:flex hidden bg-[url("../../public/bg_register.jpg")] bg-cover bg-center bg-no-repeat object-bottom-right h-full rounded-tl-full'>
        <img
          src=''
          className=' object-cover object-bottom-right h-full rounded-tl-full'
          alt=''
        />
      </div> */}
    </div>
  );
};

export default Register;
