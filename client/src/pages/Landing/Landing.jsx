/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaStore,
  FaTimes,
} from "react-icons/fa";
import {
  FaDumbbell,
  FaRocket,
  FaChartLine,
  FaUserMd,
  FaCheckCircle,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";
import { MdHealthAndSafety, MdTrendingUp } from "react-icons/md";
import SessionSwitcher from "../../components/SessionSwitcher";
import { motion } from "framer-motion";
import RoleCard from "../../components/RoleCard/RoleCard";
import { AuthContext } from "../../context/authContext";
import coachAnim from "../../assets/Tyler.json";
import sellerAnim from "../../assets/Ecommerce.json";
import affiliateAnim from "../../assets/money.json";
const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && user) {
      const role = user.role?.toLowerCase();
      switch (role) {
        case "coach":
          navigate("/coach/dashboard", { replace: true });
          break;
        case "seller":
          navigate("/seller/dashboard", { replace: true });
          break;
        case "affiliate":
          navigate("/affiliate/dashboard", { replace: true });
          break;
        default:
          navigate("/onboarding", { replace: true });
      }
    }
  }, [user, loading, navigate]);
  const features = [
    {
      icon: <FaDumbbell className='text-3xl' />,
      title: "Smart Workouts",
      description:
        "AI-powered workout plans that adapt to your progress and goals",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <FaChartLine className='text-3xl' />,
      title: "Progress Tracking",
      description: "Visual analytics to keep you motivated and on track",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaUserMd className='text-3xl' />,
      title: "Expert Coaching",
      description:
        "Connect with certified trainers and healthcare professionals",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <MdHealthAndSafety className='text-3xl' />,
      title: "Health Monitoring",
      description: "Track vitals, nutrition, and overall wellness metrics",
      color: "from-purple-500 to-pink-500",
    },
  ];
  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-slate-950 text-white'>
        <div className='flex items-center gap-3'>
          <div className='h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-red-500'></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Fitness Coach",
      avatar: "👨",
      quote:
        "FitTrackX transformed my coaching business. Earned ₹2.5L in just 3 months!",
      earnings: "₹2.5L+",
    },
    {
      name: "Priya Patel",
      role: "Product Seller",
      avatar: "👩",
      quote:
        "The platform made selling supplements seamless. My sales tripled!",
      earnings: "₹8L+",
    },
    {
      name: "Amit Kumar",
      role: "Affiliate Partner",
      avatar: "🧑",
      quote: "Weekly payouts and great commission rates. Highly recommended!",
      earnings: "₹1.2L+",
    },
  ];
  const faqs = [
    {
      q: "How does payout work?",
      a: "Weekly bank transfer every Monday. Minimum payout ₹1000.",
    },
    {
      q: "Can I switch roles?",
      a: "Yes, you can upgrade or switch anytime from your dashboard.",
    },
    {
      q: "Is there a refund policy?",
      a: "7-day money-back guarantee on all plans. No questions asked.",
    },
  ];

  const brandIcons = ["🏋️", "💪", "🏃", "🧘", "🏊", "🚴"];
  return (
    <div className='min-h-screen bg-slate-950 text-white overflow-hidden'>
      {/* Animated Background */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700'></div>
      </div>

      {/* Navigation */}
      <nav className='relative z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 shadow-lg shadow-orange-500/20'>
                <FaDumbbell className='text-xl text-white' />
              </div>
              <span className='text-xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent'>
                FitTrackX
              </span>
            </div>

            {/* Desktop Nav */}
            <div className='hidden md:flex items-center gap-8'>
              <a
                href='#features'
                className='text-sm text-slate-300 hover:text-white transition'>
                Features
              </a>
              <a
                href='#download'
                className='text-sm text-slate-300 hover:text-white transition'>
                Download
              </a>
              <a
                href='#about'
                className='text-sm text-slate-300 hover:text-white transition'>
                About
              </a>
            </div>

            {/* Auth Buttons */}
            <div className='hidden md:flex items-center gap-3'>
              <button
                onClick={() => navigate("/login")}
                className='px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition'>
                Sign In
              </button>
              <button
                onClick={() => navigate("/login")}
                className='px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition'>
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='md:hidden text-slate-300 hover:text-white'>
              {isMenuOpen ?
                <FaTimes size={24} />
              : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden bg-slate-900 border-t border-slate-800 p-4'>
            <div className='flex flex-col gap-4'>
              <a
                href='#features'
                className='text-sm text-slate-300 hover:text-white'>
                Features
              </a>
              <a
                href='#download'
                className='text-sm text-slate-300 hover:text-white'>
                Download
              </a>
              <a
                href='#about'
                className='text-sm text-slate-300 hover:text-white'>
                About
              </a>
              <hr className='border-slate-800' />
              <button
                onClick={() => navigate("/login")}
                className='text-left text-sm text-slate-300 hover:text-white'>
                Sign In
              </button>
              <button
                onClick={() => navigate("/login")}
                className='px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl'>
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className='relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-32'>
        <div className='mx-auto max-w-7xl'>
          <div className='text-center'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8'>
              <FaRocket className='text-orange-400' />
              <span className='text-sm text-slate-300'>
                Transform your fitness journey today
              </span>
            </div>

            {/* Main Heading */}
            <h1 className='text-5xl md:text-7xl font-black mb-6'>
              <span className='block text-white'>Your Personal</span>
              <span className='block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent'>
                Fitness Revolution
              </span>
            </h1>

            {/* Subtitle */}
            <p className='mx-auto max-w-2xl text-lg text-slate-400 mb-10'>
              Track workouts, monitor health, connect with experts, and achieve
              your goals with AI-powered insights and personalized coaching.
            </p>

            {/* CTA Buttons */}
            <div className='flex flex-wrap justify-center gap-4 mb-16'>
              <button
                onClick={() => navigate("/login")}
                className='group flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all hover:scale-105'>
                Start Free Trial
                <FaArrowRight className='group-hover:translate-x-1 transition' />
              </button>
              <button className='group flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white border-2 border-slate-700 rounded-2xl hover:bg-slate-800 transition-all hover:scale-105'>
                <FaPlay />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-8 max-w-3xl mx-auto'>
              {[
                { number: "10K+", label: "Active Users" },
                { number: "50K+", label: "Workouts Tracked" },
                { number: "98%", label: "Satisfaction" },
              ].map((stat, idx) => (
                <div key={idx} className='text-center'>
                  <p className='text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent'>
                    {stat.number}
                  </p>
                  <p className='text-sm text-slate-400 mt-1'>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Hero Section */}
      <div className='text-center pt-20 px-4 z-10 relative'>
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className='text-4xl md:text-6xl font-bold'>
          Build Your Fitness Empire 💪
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='text-slate-300 mt-4 max-w-xl mx-auto text-lg'>
          Join as Coach, Seller or Affiliate and start earning today 🚀
        </motion.p>
      </div>
      {/* Role Cards */}
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className='grid grid-cols-1 md:grid-cols-3 md:gap-8 gap-4 mt-16 max-w-6xl mx-auto px-4'>
        <motion.div variants={cardVariants}>
          <RoleCard
            title='Coach 👨‍🏫'
            price='One-time ₹1999 or ₹199/month'
            animation={coachAnim}
            onClick={() => navigate("/plans?role=coach")}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <RoleCard
            title='Seller 🛒'
            price='₹199/month'
            animation={sellerAnim}
            onClick={() => navigate("/checkout?role=seller")}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <RoleCard
            title='Affiliate 💸'
            price='₹199/month'
            animation={affiliateAnim}
            onClick={() => navigate("/checkout?role=affiliate")}
          />
        </motion.div>
      </motion.div>
      {/* Quick trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className='mt-16 text-center'>
        <div className='flex flex-wrap justify-center gap-8 text-slate-400 text-sm'>
          <span>🔒 Secure Payments</span>
          <span>🚀 5000+ Active Users</span>
          <span>💸 Daily Payouts</span>
          <span>⚡ Lightning Dashboard</span>
        </div>
      </motion.div>
      {/* SECTION 2: Features / Benefits */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className='mt-24 py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Why Choose FitTrackX?
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                title: "Coach: Train & Monetize",
                desc: "Create programs, host live sessions, and grow your coaching business",
                icon: (
                  <FaChalkboardTeacher className='text-3xl text-purple-400' />
                ),
              },
              {
                title: "Seller: Sell Fitness Products",
                desc: "List supplements, equipment, and merch with zero inventory hassle",
                icon: <FaStore className='text-3xl text-pink-400' />,
              },
              {
                title: "Affiliate: Earn Commissions",
                desc: "Promote products and earn up to 20% commission on every sale",
                icon: <FaMoneyBillWave className='text-3xl text-blue-400' />,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className='group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 overflow-hidden'>
                {/* Gradient border effect */}
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                <div className='relative z-10'>
                  <div className='mb-4 p-4 bg-slate-700/30 rounded-xl inline-block border border-slate-600/50'>
                    {feature.icon}
                  </div>
                  <h3 className='text-xl font-bold mb-3 text-slate-100'>
                    {feature.title}
                  </h3>
                  <p className='text-slate-400 leading-relaxed'>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: How It Works */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className='mt-24 py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Start in 3 Simple Steps ⚡
          </h2>

          <div className='relative'>
            {/* Connecting line */}
            <div className='hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transform -translate-y-1/2'></div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative'>
              {[
                {
                  step: "1",
                  title: "Sign Up",
                  desc: "Create your account in 2 minutes",
                  icon: <FaRocket className='text-purple-400' />,
                },
                {
                  step: "2",
                  title: "Choose Plan",
                  desc: "Pick the role that fits you best",
                  icon: <FaChartLine className='text-pink-400' />,
                },
                {
                  step: "3",
                  title: "Start Earning",
                  desc: "Begin your fitness journey today",
                  icon: <FaMoneyBillWave className='text-blue-400' />,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className='relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-purple-500/20 text-center'>
                  <div className='absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xl font-bold border-4 border-slate-900 shadow-lg'>
                    {item.step}
                  </div>
                  <div className='mt-6 mb-4'>
                    <div className='p-4 bg-slate-700/30 rounded-xl inline-block border border-slate-600/50'>
                      {item.icon}
                    </div>
                  </div>
                  <h3 className='text-xl font-bold mb-2 text-slate-100'>
                    {item.title}
                  </h3>
                  <p className='text-slate-400'>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 4: Pricing Clarity */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className='mt-24 py-20 bg-gradient-to-b from-slate-900/50 to-slate-800/30'>
        <div className='max-w-6xl mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Transparent Pricing 💰
          </h2>
          <p className='text-center text-slate-400 mb-12 max-w-2xl mx-auto'>
            Choose the plan that works best for your fitness business goals
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            {/* One-time fee card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              className='relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-2xl border-2 border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 shadow-xl overflow-hidden'>
              <div className='absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold'>
                BEST VALUE
              </div>
              <h3 className='text-2xl font-bold mb-2'>Coach Plan</h3>
              <div className='mb-6'>
                <span className='text-4xl font-bold text-purple-400'>
                  ₹1,999
                </span>
                <span className='text-slate-400 ml-2'>one-time</span>
              </div>
              <ul className='space-y-3'>
                {[
                  "Lifetime access to platform",
                  "All premium features",
                  "₹100Cr+ earning potential",
                  "Priority support",
                ].map((item, i) => (
                  <li key={i} className='flex items-center text-slate-300'>
                    <FaCheckCircle className='text-green-400 mr-3' /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Monthly fee card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              className='relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-2xl border-2 border-slate-600/50 hover:border-pink-500/50 transition-all duration-300 shadow-xl overflow-hidden'>
              <div className='absolute top-0 right-0 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold'>
                FLEXIBLE
              </div>
              <h3 className='text-2xl font-bold mb-2'>Monthly Access</h3>
              <div className='mb-6'>
                <span className='text-4xl font-bold text-pink-400'>₹199</span>
                <span className='text-slate-400 ml-2'>/month</span>
              </div>
              <ul className='space-y-3'>
                {[
                  "Full platform access",
                  "Cancel anytime",
                  "Weekly payouts",
                  "Standard support",
                ].map((item, i) => (
                  <li key={i} className='flex items-center text-slate-300'>
                    <FaCheckCircle className='text-green-400 mr-3' /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <p className='text-center text-slate-400 mt-8'>
            * Seller & Affiliate plans start at ₹199/month with competitive
            commission rates
          </p>
        </div>
      </motion.section>
      {/* Features Section */}
      <section
        id='features'
        className='relative z-10 px-4 sm:px-6 lg:px-8 py-20'>
        <div className='mx-auto max-w-7xl'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
              Everything You Need to{" "}
              <span className='bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent'>
                Succeed
              </span>
            </h2>
            <p className='text-lg text-slate-400 max-w-2xl mx-auto'>
              Comprehensive tools and features designed to support every aspect
              of your fitness journey
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, idx) => (
              <div
                key={idx}
                className='group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-6 hover:border-orange-500/50 transition-all hover:shadow-2xl hover:shadow-orange-500/10'>
                <div
                  className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold text-white mb-2'>
                  {feature.title}
                </h3>
                <p className='text-slate-400 text-sm'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* SECTION 5: Testimonials */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className='mt-24 py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Success Stories 🌟
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className='bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-purple-500/20'>
                <div className='flex items-center mb-4'>
                  <div className='text-5xl mr-4 bg-slate-700/50 p-3 rounded-xl border border-slate-600/50'>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className='font-bold text-lg text-slate-100'>
                      {testimonial.name}
                    </h4>
                    <p className='text-slate-400'>{testimonial.role}</p>
                  </div>
                </div>
                <p className='text-slate-300 mb-4 italic'>
                  "{testimonial.quote}"
                </p>
                <div className='inline-flex items-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-2 rounded-full border border-purple-500/30'>
                  <FaStar className='text-yellow-400 mr-2' />
                  <span className='font-bold text-purple-300'>
                    {testimonial.earnings} Earned
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      {/* SECTION 6: FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className='mt-24 py-20 bg-slate-900/50 backdrop-blur-sm border-y border-slate-800/50'>
        <div className='max-w-3xl mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Frequently Asked Questions ❓
          </h2>

          <div className='space-y-4'>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className='bg-gradient-to-r from-slate-800/90 to-slate-900/90 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 shadow-lg'>
                <h3 className='text-lg font-bold mb-2 text-slate-100'>
                  {faq.q}
                </h3>
                <p className='text-slate-300'>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      {/* SECTION 7: Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className='mt-24 py-20 text-center'>
        <div className='max-w-4xl mx-auto px-6'>
          <h2 className='text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'>
            Start Your Fitness Empire Today 🚀
          </h2>
          <p className='text-xl text-slate-300 mb-10 max-w-2xl mx-auto'>
            Join thousands of fitness entrepreneurs who are already earning with
            FitTrackX. Your journey starts now.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className='bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-2xl border border-slate-700/50 max-w-lg mx-auto shadow-2xl'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              className='flex flex-col gap-4'>
              <input
                type='email'
                placeholder='Enter your email'
                className='w-full px-6 py-4 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-purple-500 focus:outline-none text-white placeholder-slate-500 text-lg'
                required
              />
              <button
                type='submit'
                className='px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 text-lg font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 border border-purple-500/20'>
                Get Started Free 🚀
              </button>
            </form>
            <p className='text-slate-400 text-sm mt-4'>
              No credit card required. Start your free trial today.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Download Section */}
      <section
        id='download'
        className='relative z-10 px-4 sm:px-6 lg:px-8 py-20'>
        <div className='mx-auto max-w-7xl'>
          <div className='rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 md:p-16 text-center'>
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
              Get FitTrackX Today
            </h2>
            <p className='text-lg text-slate-400 mb-10 max-w-2xl mx-auto'>
              Download our mobile app and take your fitness journey anywhere.
              Available on iOS and Android.
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <button className='flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl hover:bg-slate-800 transition'>
                <FaApple className='text-3xl' />
                <div className='text-left'>
                  <p className='text-xs text-slate-400'>Download on the</p>
                  <p className='text-lg font-semibold'>App Store</p>
                </div>
              </button>
              <button className='flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl hover:bg-slate-800 transition'>
                <FaGooglePlay className='text-3xl' />
                <div className='text-left'>
                  <p className='text-xs text-slate-400'>Get it on</p>
                  <p className='text-lg font-semibold'>Google Play</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='relative z-10 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mx-auto max-w-7xl'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'>
                <FaDumbbell className='text-white' />
              </div>
              <span className='font-bold text-white'>FitTrackX</span>
            </div>
            <p className='text-sm text-slate-400'>
              © 2026 FitTrackX. All rights reserved.
            </p>
            <div className='flex items-center gap-4'>
              <a
                href='#'
                className='text-slate-400 hover:text-white transition'>
                Privacy
              </a>
              <a
                href='#'
                className='text-slate-400 hover:text-white transition'>
                Terms
              </a>
              <a
                href='#'
                className='text-slate-400 hover:text-white transition'>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
