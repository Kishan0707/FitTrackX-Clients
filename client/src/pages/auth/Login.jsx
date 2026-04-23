import { useContext, useState } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaDumbbell,
  FaUserMd,
} from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import Register from "./Register";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePanel = () => setIsRegister(!isRegister);

  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await login(loginFormData);
      setSuccess("Login Successful");

      setTimeout(() => {
        switch (res?.role) {
          case "admin":
            navigate("/admin");
            break;
          case "coach":
            navigate("/coachDashboard");
            break;
          case "doctor":
            navigate("/doctor");
            break;
          case "seller":
            navigate("/sellerDashboard");
            break;
          case "affiliate":
            navigate("/affiliateDashboard");
            break;
          default:
            navigate("/onboarding");
        }
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700'></div>
        <div className='absolute top-1/2 left-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl animate-bounce'></div>
      </div>

      {/* Main Container */}
      <div className='w-full max-w-4xl relative z-10'>
        {/* Logo & Brand */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 shadow-2xl shadow-orange-500/30 mb-4 transform hover:scale-105 transition-transform'>
            <FaDumbbell className='text-4xl text-white' />
          </div>
          <h1 className='text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent'>
            FitTrackX
          </h1>
          <p className='text-slate-400 mt-2 text-lg'>
            Your fitness journey starts here
          </p>
        </div>

        {/* Auth Card */}
        <div className='bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-2xl overflow-hidden'>
          <div className='flex flex-col lg:flex-row min-h-[600px] overflow-hidden'>
            {/* Left Panel - Forms */}
            <div className='w-full md:p-8 lg:p-12 relative'>
              {/* Slider Container */}
              <div
                className={`flex  items-center transition-transform duration-700 ease-in-out w-full   ${
                  isRegister ? "-translate-x-1/2 " : "translate-x-0"
                }`}
                style={{ width: "200%" }}>
                {/* Login Form */}
                <div className='w-1/2 shrink-0 h-fit px-14 flex '>
                  <div className=' w-full'>
                    <h2 className='text-3xl font-bold text-white mb-2'>
                      Welcome Back
                    </h2>
                    <p className='text-slate-400 mb-8'>
                      Login to continue your fitness journey
                    </p>

                    <form onSubmit={handleSubmit} className='space-y-5'>
                      {/* Email Input */}
                      <div className='relative group'>
                        <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors'>
                          <FaEnvelope className='text-lg' />
                        </div>
                        <input
                          type='email'
                          name='email'
                          value={loginFormData.email}
                          onChange={handleChange}
                          placeholder='Email address'
                          className='w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
                          required
                        />
                      </div>

                      {/* Password Input */}
                      <div className='relative group'>
                        <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors'>
                          <FaLock className='text-lg' />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name='password'
                          value={loginFormData.password}
                          onChange={handleChange}
                          placeholder='Password'
                          className='w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
                          required
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-500 transition-colors'>
                          {showPassword ?
                            <FaEyeSlash />
                          : <FaEye />}
                        </button>
                      </div>

                      {/* Forgot Password */}
                      <div className='flex justify-end'>
                        <Link
                          to='/forgot-password'
                          className='text-sm text-orange-400 hover:text-orange-300 transition-colors'>
                          Forgot password?
                        </Link>
                      </div>

                      {/* Submit Button */}
                      <button
                        type='submit'
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                          loading ?
                            "bg-slate-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25"
                        }`}>
                        {loading ?
                          <span className='flex items-center justify-center gap-3'>
                            <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></span>
                            Signing in...
                          </span>
                        : "Sign In"}
                      </button>

                      {/* Error/Success Messages */}
                      {error && (
                        <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center'>
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className='p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center'>
                          {success}
                        </div>
                      )}
                    </form>

                    {/* Divider */}
                    <div className='mt-8 relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-slate-700'></div>
                      </div>
                      <div className='relative flex justify-center text-sm'>
                        <span className='px-4 bg-transparent text-slate-500'>
                          or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Login Placeholder */}
                    <div className='mt-6 grid grid-cols-2 gap-3'>
                      <button className='flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700'>
                        <svg
                          className='w-5 h-5'
                          viewBox='0 0 24 24'
                          fill='currentColor'>
                          <path
                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                            fill='#4285F4'
                          />
                          <path
                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                            fill='#34A853'
                          />
                          <path
                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                            fill='#FBBC05'
                          />
                          <path
                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                            fill='#EA4335'
                          />
                        </svg>
                        <span className='text-slate-300 text-sm'>Google</span>
                      </button>
                      <button className='flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700'>
                        <svg
                          className='w-5 h-5'
                          fill='currentColor'
                          viewBox='0 0 24 24'>
                          <path d='M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z' />
                        </svg>
                        <span className='text-slate-300 text-sm'>GitHub</span>
                      </button>
                    </div>

                    {/* Toggle to Register */}
                    <p className='mt-8 text-center text-slate-400'>
                      Don't have an account?{" "}
                      <button
                        onClick={() => setIsRegister(true)}
                        className='text-orange-400 hover:text-orange-300 font-semibold transition-colors'>
                        Sign up
                      </button>
                    </p>
                  </div>
                </div>

                {/* Register Form */}
                <div className='w-1/2 shrink-0 h-fit px-14 py-5 flex'>
                  <Register togglePanel={togglePanel} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center text-slate-500 text-sm'>
          <p>
            © 2025 FitTrackX. All rights reserved. | Privacy Policy | Terms of
            Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
