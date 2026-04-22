import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import RoleCard from "../../components/RoleCard/RoleCard";
import coachAnim from "../../assets/Tyler.json";
import sellerAnim from "../../assets/Ecommerce.json";
import affiliateAnim from "../../assets/money.json";
import {
  FaChalkboardTeacher,
  FaStore,
  FaMoneyBillWave,
  FaRocket,
  FaChartLine,
  FaBox,
  FaBolt,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

const Landing = () => {
  const navigate = useNavigate();
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
    <div className='relative overflow-hidden min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white'>
      {/* Background blur blobs */}
      <div className='absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full'></div>
      <div className='absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] bg-pink-500/20 blur-[120px] rounded-full'></div>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full'></div>

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

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className='text-center md:mt-12 mt-9'>
        <button
          onClick={() => navigate("/login")}
          className='px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 text-lg font-semibold shadow-lg shadow-purple-500/30 hover:scale-105 hover:shadow-purple-500/50 border border-purple-500/20'>
          Start Free Today 🚀
        </button>
      </motion.div>

      {/* SECTION 1: Trust + Social Proof */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className='mt-24 py-20 bg-slate-900/50 backdrop-blur-sm border-y border-slate-800/50'>
        <div className='max-w-6xl mx-auto px-6'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'>
            Trusted by Fitness Entrepreneurs Worldwide
          </h2>

          {/* Brand icon marquee */}
          <div className='flex justify-center items-center gap-8 md:gap-16 mb-12 flex-wrap'>
            {brandIcons.map((icon, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className='text-4xl md:text-5xl bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-purple-500/20 transition-all duration-300'>
                {icon}
              </motion.div>
            ))}
          </div>

          {/* Counter metrics */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            {[
              { value: "10K+", label: "Coaches" },
              { value: "50K+", label: "Products Sold" },
              { value: "₹100Cr+", label: "Earnings" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className='p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300'>
                <p className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                  {stat.value}
                </p>
                <p className='text-slate-300 mt-2 text-lg'>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

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
    </div>
  );
};

export default Landing;
