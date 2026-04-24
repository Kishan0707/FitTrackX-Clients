import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaCircle,
  FaFire,
  FaLeaf,
  FaRegLightbulb,
  FaRunning,
  FaBed,
  FaAppleAlt,
  FaHeartbeat,
  FaClipboardCheck,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaTrophy,
  FaStar,
  FaCalendarAlt,
  FaSearch,
  FaArrowDown,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";

// Enhanced tips structure with step-by-step actionable items
const tips = [
  {
    id: 1,
    title: "Hair Fall Control",
    category: "hair",
    tags: ["hair", "protein", "nutrition"],
    icon: "💇",
    difficulty: "Medium",
    duration: "4-6 weeks",
    estimatedTime: "15 min/day",
    summary:
      "Regrow stronger hair by fixing protein deficiency and improving scalp care routine.",
    steps: [
      {
        id: "s1",
        title: "Boost Protein Intake",
        description: "Add 2 servings of protein-rich foods daily",
        actions: [
          "Have paneer/tofu with lunch",
          "Drink whey protein shake post-workout",
          "Include soy chunks in dinner",
        ],
        completed: false,
      },
      {
        id: "s2",
        title: "Scalp Massage Therapy",
        description: "Massage scalp 3x per week with warm oil",
        actions: [
          "Warm coconut/onion oil",
          "Massage gently for 10 minutes",
          "Leave overnight or 2+ hours before wash",
        ],
        completed: false,
      },
      {
        id: "s3",
        title: "Nutrient Boosters",
        description: "Consume hair-friendly seeds and nuts daily",
        actions: [
          "1 tbsp pumpkin seeds",
          "4-5 soaked almonds",
          "1 tbsp flax seeds (optional)",
        ],
        completed: false,
      },
      {
        id: "s4",
        title: "Scalp Care Upgrade",
        description: "Switch to gentle, chemical-free shampoo",
        actions: [
          "Use sulfate-free shampoo",
          "Wash hair 3-4x/week (not daily)",
          "Avoid hot water - use lukewarm",
        ],
        completed: false,
      },
      {
        id: "s5",
        title: "Sleep & Stress Management",
        description: "Prioritize 7-8 hours sleep and stress reduction",
        actions: [
          "Fix sleep schedule (10 PM - 6 AM)",
          "Practice 5 min deep breathing",
          "Avoid tight hairstyles",
        ],
        completed: false,
      },
    ],
    causes: [
      "Low protein intake",
      "Stress & poor sleep",
      "Vitamin deficiency (Biotin, B12)",
      "Hard water / dandruff",
    ],
    solution: [
      "Increase protein (paneer, soy, whey)",
      "Eat pumpkin seeds & nuts",
      "Massage scalp 2–3 times/week",
      "Use mild shampoo (avoid chemicals)",
    ],
    diet: [
      "Paneer, tofu, soy chunks",
      "Pumpkin seeds, flax seeds",
      "Green vegetables",
    ],
    lifestyle: ["Sleep 7–8 hours", "Reduce stress", "Avoid tight hairstyles"],
    avoid: ["Junk food", "Excess heat styling", "Chemical treatments"],
    impact: "Hair Growth • Strength • Scalp Health",
    color: "from-purple-500 to-pink-500",
  },

  {
    id: 2,
    title: "Acne-Free Skin",
    category: "skin",
    tags: ["skin", "oil", "hormones"],
    icon: "🧴",
    difficulty: "Medium",
    duration: "3-5 weeks",
    estimatedTime: "20 min/day",
    summary:
      "Clear acne by balancing oil production and maintaining a consistent skincare routine.",
    steps: [
      {
        id: "s1",
        title: "Face Wash Routine",
        description: "Wash face exactly twice daily with appropriate cleanser",
        actions: [
          "Morning: Gentle salicylic acid wash",
          "Evening: Remove sunscreen/makeup first",
          "Pat dry - don't rub",
        ],
        completed: false,
      },
      {
        id: "s2",
        title: "Hydration Target",
        description: "Drink 3-4 liters of water daily for toxin flush",
        actions: [
          "1L on waking (empty stomach)",
          "1L before lunch",
          "1L after lunch",
          "1L before dinner",
        ],
        completed: false,
      },
      {
        id: "s3",
        title: "Dietary Adjustments",
        description: "Eliminate or reduce acne-triggering foods",
        actions: [
          "Cut sugary drinks & snacks",
          "Reduce dairy if sensitive",
          "Increase fruits (orange, papaya)",
        ],
        completed: false,
      },
      {
        id: "s4",
        title: "Hygiene Habits",
        description: "Maintain cleanliness of face-contacting items",
        actions: [
          "Change pillow covers 2x/week",
          "Don't touch face with dirty hands",
          "Clean phone screen daily",
        ],
        completed: false,
      },
      {
        id: "s5",
        title: "Skin-Friendly Lifestyle",
        description: "Sleep and stress management for hormonal balance",
        actions: [
          "Sleep by 11 PM (7-8 hours)",
          "Avoid over-washing (strips natural oils)",
          "Use non-comedogenic sunscreen",
        ],
        completed: false,
      },
    ],
    causes: [
      "Oily skin",
      "Junk food & sugar",
      "Hormonal imbalance",
      "Poor skincare routine",
    ],
    solution: [
      "Wash face twice daily",
      "Use salicylic acid face wash",
      "Drink 3–4L water",
      "Avoid touching face frequently",
    ],
    diet: ["Fruits (orange, papaya)", "Green vegetables", "Low sugar diet"],
    lifestyle: ["Proper sleep", "Reduce stress", "Clean pillow covers"],
    avoid: ["Oily food", "Dairy (if sensitive)", "Over-washing face"],
    impact: "Clear Skin • Confidence • Oil Balance",
    color: "from-blue-500 to-cyan-500",
  },

  {
    id: 3,
    title: "Healthy Weight Gain",
    category: "fitness",
    tags: ["fitness", "muscle", "bulk"],
    icon: "💪",
    difficulty: "Hard",
    duration: "8-12 weeks",
    estimatedTime: "1 hour training + meal prep",
    summary:
      "Build muscle mass with structured calorie surplus and progressive strength training.",
    steps: [
      {
        id: "s1",
        title: "Calorie Surplus Plan",
        description: "Eat 300-500 calories above maintenance daily",
        actions: [
          "Calculate TDEE online",
          "Add 2 extra meals (snacks)",
          "Track calories for first 2 weeks",
        ],
        completed: false,
      },
      {
        id: "s2",
        title: "Frequent Meals",
        description: "Eat every 2.5-3 hours (6-7 meals/day)",
        actions: [
          "Breakfast 8 AM",
          "Mid-morning 11 AM",
          "Lunch 1:30 PM",
          "Evening snack 4:30 PM",
          "Pre-workout 6 PM",
          "Post-workout 7:30 PM",
          "Dinner 9 PM",
        ],
        completed: false,
      },
      {
        id: "s3",
        title: "Calorie-Dense Foods",
        description: "Focus on high-calorie, nutrient-rich foods",
        actions: [
          "Rice & roti (not salads)",
          "Peanut butter & ghee",
          "Banana shake with milk",
          "Paneer/cheese daily",
        ],
        completed: false,
      },
      {
        id: "s4",
        title: "Strength Training",
        description: "Gym 4-5x/week with progressive overload",
        actions: [
          "Day 1: Chest + Triceps",
          "Day 2: Back + Biceps",
          "Day 3: Rest",
          "Day 4: Legs",
          "Day 5: Shoulders",
          "Day 6+7: Rest/light cardio",
        ],
        completed: false,
      },
      {
        id: "s5",
        title: "Protein & Recovery",
        description: "Supplement with whey protein, prioritize sleep",
        actions: [
          "Whey protein post-workout (25g)",
          "Sleep 8+ hours nightly",
          "Rest days are mandatory",
          "Stay consistent - no missed meals",
        ],
        completed: false,
      },
    ],
    causes: ["Low calorie intake", "Fast metabolism", "Skipping meals"],
    avoid: [
      "Skipping meals",
      "Only cardio",
      "Low protein diet",
      "Inconsistent training",
    ],
    impact: "Muscle Gain • Strength • Size",
    color: "from-amber-500 to-orange-600",
  },

  {
    id: 4,
    title: "Energy & Vitality",
    category: "lifestyle",
    tags: ["energy", "sleep", "stress"],
    icon: "⚡",
    difficulty: "Easy",
    duration: "1-2 weeks",
    estimatedTime: "Ongoing habits",
    summary:
      "Boost daily energy through better sleep, hydration, and balanced nutrition.",
    steps: [
      {
        id: "s1",
        title: "Hydration Protocol",
        description: "Drink 3 liters of water every single day",
        actions: [
          "1L on waking (within 1 hour)",
          "500ml before lunch",
          "500ml mid-afternoon",
          "500ml before dinner",
          "Set phone reminders if needed",
        ],
        completed: false,
      },
      {
        id: "s2",
        title: "Sleep Schedule Fix",
        description: "Get 7-8 hours of quality sleep consistently",
        actions: [
          "Fix bedtime: 10:30 PM",
          "No screens 1 hour before bed",
          "Keep room dark & cool",
          "Wake up same time daily",
        ],
        completed: false,
      },
      {
        id: "s3",
        title: "Meal Balance",
        description: "Eat balanced meals with complex carbs + protein",
        actions: [
          "Breakfast: Oats + eggs",
          "Lunch: Rice/roti + veg + dal",
          "Dinner: Light + protein",
          "Never skip breakfast",
        ],
        completed: false,
      },
      {
        id: "s4",
        title: "Screen & Break Management",
        description: "Reduce digital eye strain and take movement breaks",
        actions: [
          "20-20-20 rule (every 20 min, look 20ft away for 20s)",
          "5 min walk every hour",
          "Morning sunlight 10-15 min",
        ],
        completed: false,
      },
    ],
    causes: [
      "Sleep deprivation",
      "Dehydration",
      "Poor nutrition",
      "Excess screen time",
    ],
    avoid: [
      "Late night scrolling",
      "Skipping breakfast",
      "Junk food",
      " Irregular sleep",
    ],
    impact: "Energy • Focus • Productivity",
    color: "from-yellow-500 to-lime-500",
  },
];

const HealthTips = () => {
  const [search, setSearch] = useState("");
  const [selectedTip, setSelectedTip] = useState(null);
  const [activeTag, setActiveTag] = useState("all");
  const [completedSteps, setCompletedSteps] = useState({}); // { "1-s1": true, "1-s2": false, ... }
  const [expandedStep, setExpandedStep] = useState(null);

  // Calculate progress for each tip
  const getProgress = (tip) => {
    const steps = tip.steps;
    if (!steps.length) return 0;
    const completed = steps.filter(
      (step) => completedSteps[`${tip.id}-${step.id}`],
    ).length;
    return Math.round((completed / steps.length) * 100);
  };

  const toggleStep = (tipId, stepId) => {
    const key = `${tipId}-${stepId}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const totalProgress = useMemo(() => {
    const allSteps = tips.flatMap((tip) =>
      (tip.steps || []).map((step) => `${tip.id}-${step.id}`),
    );
    const completedCount = allSteps.filter((key) => completedSteps[key]).length;
    return Math.round((completedCount / allSteps.length) * 100);
  }, [completedSteps]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    tips.forEach((tip) => tip.tags.forEach((tag) => tags.add(tag)));
    return ["all", ...Array.from(tags)];
  }, []);

  const filteredTips = useMemo(() => {
    return tips.filter((tip) => {
      const matchesTag =
        activeTag === "all" ? true : tip.tags.includes(activeTag);
      const matchesSearch =
        tip.title.toLowerCase().includes(search.toLowerCase()) ||
        tip.tags.some((tag) => tag.includes(search.toLowerCase()));
      return matchesTag && matchesSearch;
    });
  }, [activeTag, search]);

  const popularProblems = ["Hair Fall", "Acne", "Weight Gain", "Low Energy"];

  // Sort tips by completion status (incomplete first)
  const sortedTips = useMemo(() => {
    return [...filteredTips].sort((a, b) => {
      const stepsA = a.steps || [];
      const stepsB = b.steps || [];
      if (stepsA.length === 0 || stepsB.length === 0) return 0;
      const completedA = stepsA.filter(
        (step) => completedSteps[`${a.id}-${step.id}`],
      ).length;
      const completedB = stepsB.filter(
        (step) => completedSteps[`${b.id}-${step.id}`],
      ).length;
      return completedA / stepsA.length - completedB / stepsB.length;
    });
  }, [filteredTips, completedSteps]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 20 },
    },
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 md:px-6 lg:px-8'>
        {/* Ambient background effects */}
        <div className='fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10'>
          <div className='absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-full blur-[120px] animate-pulse' />
          <div className='absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-[120px] animate-pulse' />
        </div>

        {/* 🎯 PROGRESS BAR - Fixed top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='fixed top-0 left-0 right-0 z-40 h-1 bg-slate-800/50 backdrop-blur-sm'>
          <motion.div
            className='h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600'
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>

        {/* Spacer to prevent content hiding behind fixed bar */}
        <div className='h-1' />

        <div className='space-y-8 max-w-7xl mx-auto py-6 md:py-8'>
          {/* 🔥 HEADER */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-6 pt-6'>
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.5em] text-slate-500 font-semibold'>
                  Health Coach Approved
                </p>
                <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mt-2'>
                  Daily Rituals
                </h1>
                <p className='text-slate-400 mt-2 max-w-xl'>
                  Small habits. Big results. Follow these step-by-step routines
                  to transform your health — one day at a time.
                </p>
              </div>

              {/* Progress Summary Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='flex flex-wrap items-center gap-4'>
                <div className='rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 min-w-[140px]'>
                  <div className='flex items-center gap-2 mb-1'>
                    <FaCalendarAlt className='text-orange-400' />
                    <span className='text-xs uppercase tracking-wider text-slate-400'>
                      Overall
                    </span>
                  </div>
                  <p className='text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent'>
                    {totalProgress}%
                  </p>
                  <p className='text-[10px] text-slate-500'>completed</p>
                </div>

                <div className='rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 min-w-[140px]'>
                  <div className='flex items-center gap-2 mb-1'>
                    <FaClipboardCheck className='text-orange-400' />
                    <span className='text-xs uppercase tracking-wider text-slate-400'>
                      Steps
                    </span>
                  </div>
                  <p className='text-3xl font-bold text-white'>
                    {Object.values(completedSteps).filter(Boolean).length}
                  </p>
                  <p className='text-[10px] text-slate-500'>done</p>
                </div>
              </motion.div>
            </div>

            {/* Search + Filter */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='relative flex-1'>
                <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  value={search}
                  onChange={(evt) => setSearch(evt.target.value)}
                  type='search'
                  placeholder='Search tips (hair, skin, energy, muscle...)'
                  className='w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all'
                />
              </div>
            </div>
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTag === tag ?
                      "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-slate-900/60 text-slate-300 border border-slate-700 hover:border-orange-500/40"
                  }`}>
                  {tag === "all" ? "🔥 All" : `#${tag}`}
                </button>
              ))}
            </div>

            {/* Popular Problems Pills */}
            <div className='space-y-3'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold'>
                🔥 Quick Access
              </p>
              <div className='flex gap-3 overflow-x-scroll pb-2'>
                {popularProblems.map((problem) => {
                  const emojiMap = {
                    "Hair Fall": "💇",
                    Acne: "🧴",
                    "Weight Gain": "💪",
                    "Low Energy": "⚡",
                  };
                  return (
                    <motion.button
                      key={problem}
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearch(problem)}
                      className={`flex items-center gap-2.5 md:px-5 px-2.5 md:py-3 py-1.5 rounded-2xl transition-all border ${
                        search === problem ?
                          "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-xl scale-105 border-orange-500"
                        : "bg-slate-900/70 text-slate-300 border-slate-700 hover:border-orange-500/50"
                      }`}>
                      <span className='text-2xl'>{emojiMap[problem]}</span>
                      <span className='text-sm font-medium uppercase tracking-wide'>
                        {problem}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.header>

          {/* 🎯 TIPS GRID - With Step Counter */}
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {sortedTips.map((tip) => {
              const progress = getProgress(tip);
              const isCompleted = progress === 100;

              return (
                <motion.div
                  key={tip.id}
                  variants={cardVariants}
                  className='group relative flex flex-col rounded-3xl border bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-orange-500/10'
                  style={{
                    borderColor:
                      isCompleted ?
                        "rgba(34, 197, 94, 0.3)"
                      : "rgba(51, 65, 85, 0.5)",
                  }}>
                  {/* Progress Ring (top-right corner) */}
                  <div className='absolute top-4 right-4'>
                    <svg className='w-10 h-10 transform -rotate-90'>
                      <circle
                        cx='20'
                        cy='20'
                        r='16'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='3'
                        className='text-slate-700'
                      />
                      <circle
                        cx='20'
                        cy='20'
                        r='16'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='3'
                        strokeDasharray={`${(progress / 100) * 100} 100`}
                        className={
                          isCompleted ? "text-green-400" : "text-orange-400"
                        }
                        strokeLinecap='round'
                      />
                    </svg>
                    {isCompleted && (
                      <FaCheckCircle className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-400 text-sm' />
                    )}
                  </div>

                  {/* Icon + Title */}
                  <div className='flex items-start gap-4 mb-4'>
                    <div className='flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 text-2xl'>
                      {tip.icon}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h3 className='text-lg font-bold text-white group-hover:text-orange-300 transition-colors break-words max-w-full'>
                          {tip.title}
                        </h3>
                        <span className='text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20'>
                          {tip.difficulty}
                        </span>
                      </div>
                      <p className='text-xs text-slate-400'>
                        Est. {tip.duration} • {tip.estimatedTime}/day
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='mb-4'>
                    <div className='flex justify-between text-xs mb-1'>
                      <span className='text-slate-400'>Progress</span>
                      <span
                        className={
                          isCompleted ?
                            "text-green-400 font-medium"
                          : "text-orange-400 font-medium"
                        }>
                        {progress}%
                      </span>
                    </div>
                    <div className='h-2 rounded-full bg-slate-800/50 overflow-hidden'>
                      <motion.div
                        className={`h-full rounded-full ${isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-red-600"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <p className='text-sm text-slate-300 line-clamp-3 mb-4 break-words'>
                    {tip.summary}
                  </p>

                  {/* Tags */}
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {(tip.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className='text-[10px] px-2 py-1 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50'>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className='mt-auto flex items-center justify-between gap-3'>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTip(tip)}
                      className='flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-all'>
                      {isCompleted ? "Review Journey ✓" : "Start Journey →"}
                    </motion.button>

                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/20 border border-green-500/30'>
                        <FaTrophy className='text-green-400' />
                        <span className='text-sm font-bold text-green-400'>
                          Done
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* 🎯 DETAILED MODAL */}
          <AnimatePresence>
            {selectedTip && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedTip(null)}
                  className='fixed inset-0 bg-black/80 backdrop-blur-md z-50'
                />

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className='fixed inset-0 z-50 flex items-start justify-center p-4 md:p-6 overflow-y-auto'>
                  <div className='w-full max-w-4xl rounded-3xl border bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl my-8'>
                    {/* Header with gradient accent */}
                    <div
                      className={`relative overflow-hidden rounded-t-3xl bg-gradient-to-r ${selectedTip.color} p-6 md:p-8`}>
                      <div className='absolute inset-0 bg-black/20' />
                      <div className='relative z-10 flex items-start justify-between'>
                        <div>
                          <div className='flex items-center gap-3 mb-2'>
                            <span className='text-4xl'>{selectedTip.icon}</span>
                            <div>
                              <h2 className='text-2xl md:text-3xl font-bold text-white'>
                                {selectedTip.title}
                              </h2>
                              <p className='text-orange-100 text-sm'>
                                {selectedTip.impact}
                              </p>
                            </div>
                          </div>
                          <div className='flex flex-wrap gap-3 mt-3'>
                            <span className='px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium'>
                              {selectedTip.difficulty}
                            </span>
                            <span className='px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium'>
                              ⏱ {selectedTip.duration}
                            </span>
                            <span className='px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium'>
                              🕐 {selectedTip.estimatedTime}/day
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTip(null)}
                          className='p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors'>
                          <FaTimes className='text-xl' />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className='p-6 md:p-8 space-y-6'>
                      {/* Summary */}
                      <p className='text-lg text-slate-300 leading-relaxed'>
                        {selectedTip.summary}
                      </p>

                      {/* STEP-BY-STEP ACTION PLAN */}
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2 mb-4'>
                          <FaClipboardCheck className='text-orange-400 text-xl' />
                          <h3 className='text-xl font-bold text-white'>
                            Action Plan
                          </h3>
                          <span className='text-sm text-slate-400'>
                            ({getProgress(selectedTip)}% complete)
                          </span>
                        </div>

                        {selectedTip.steps.map((step, index) => {
                          const stepKey = `${selectedTip.id}-${step.id}`;
                          const isStepCompleted = completedSteps[stepKey];
                          const isExpanded = expandedStep === step.id;

                          return (
                            <motion.div
                              key={step.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`rounded-2xl border transition-all duration-300 ${
                                isStepCompleted ?
                                  "bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-700/50"
                                : "bg-slate-900/60 border-slate-700/50 hover:border-orange-500/40"
                              }`}>
                              {/* Step Header (Clickable - Expand/Collapse only) */}
                              <button
                                onClick={() => {
                                  setExpandedStep(isExpanded ? null : step.id);
                                }}
                                className='w-full p-5 flex items-start gap-4 text-left'>
                                {/* Step Number + Checkbox */}
                                <div className='relative flex-shrink-0'>
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                                      isStepCompleted ?
                                        "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                                      : "bg-slate-800 text-slate-400 border border-slate-600"
                                    }`}>
                                    {isStepCompleted ?
                                      <FaCheckCircle />
                                    : index + 1}
                                  </div>
                                </div>

                                {/* Step Info */}
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <h4
                                      className={`text-lg font-semibold ${isStepCompleted ? "text-green-300 line-through" : "text-white"}`}>
                                      {step.title}
                                    </h4>
                                    {isStepCompleted && (
                                      <FaCheckCircle className='text-green-400' />
                                    )}
                                  </div>
                                  <p className='text-sm text-slate-400'>
                                    {step.description}
                                  </p>
                                </div>

                                {/* Expand/Collapse Arrow */}
                                <div
                                  className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                  <FaArrowDown className='text-slate-400' />
                                </div>
                              </button>

                              {/* Expanded Actions List */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className='overflow-hidden'>
                                    <div className='px-5 pb-24 space-y-3'>
                                      <div className='h-px bg-slate-700/50 mb-3' />
                                      {(step.actions || []).map((action, i) => (
                                        <div
                                          key={i}
                                          className='flex items-start gap-3 text-slate-300'>
                                          <FaCheckCircle className='text-green-400 mt-0.5 flex-shrink-0' />
                                          <span className='text-sm break-words'>
                                            {action}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Sticky Mark Complete Bar */}
                                    <div className='sticky bottom-0 pt-4 pb-5 px-5 mt-2 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-md z-10'>
                                      {!isStepCompleted ?
                                        <motion.button
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStep(selectedTip.id, step.id);
                                          }}
                                          className='w-full py-3 rounded-xl border-2 border-dashed border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500 transition-all flex items-center justify-center gap-2 font-medium'>
                                          <FaCheckCircle />
                                          <span>
                                            Mark this step as complete
                                          </span>
                                        </motion.button>
                                      : <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className='w-full py-3 rounded-xl bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-700/50 text-green-300 flex items-center justify-center gap-2 font-medium'>
                                          <FaCheckCircle />
                                          <span>Step completed! 🎉</span>
                                        </motion.div>
                                      }
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Additional Sections */}
                      <div className='grid md:grid-cols-2 gap-6'>
                        {/* Causes */}
                        <div className='rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5'>
                          <h4 className='text-red-300 font-semibold mb-3 flex items-center gap-2'>
                            🔥 Causes
                          </h4>
                          <ul className='space-y-2'>
                            {selectedTip.causes.map((cause, i) => (
                              <li
                                key={i}
                                className='text-sm text-slate-400 flex items-start gap-2'>
                                <span className='text-red-400'>•</span>
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Diet */}
                        <div className='rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5'>
                          <h4 className='text-green-300 font-semibold mb-3 flex items-center gap-2'>
                            🥗 Diet
                          </h4>
                          <ul className='space-y-2'>
                            {selectedTip.diet.map((item, i) => (
                              <li
                                key={i}
                                className='text-sm text-slate-400 flex items-start gap-2'>
                                <FaAppleAlt className='text-green-400 mt-0.5' />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Lifestyle */}
                        <div className='rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5'>
                          <h4 className='text-blue-300 font-semibold mb-3 flex items-center gap-2'>
                            💤 Lifestyle
                          </h4>
                          <ul className='space-y-2'>
                            {selectedTip.lifestyle.map((item, i) => (
                              <li
                                key={i}
                                className='text-sm text-slate-400 flex items-start gap-2'>
                                <FaBed className='text-blue-400 mt-0.5' />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Avoid */}
                        <div className='rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5'>
                          <h4 className='text-yellow-300 font-semibold mb-3 flex items-center gap-2'>
                            🚫 Avoid
                          </h4>
                          <ul className='space-y-2'>
                            {selectedTip.avoid.map((item, i) => (
                              <li
                                key={i}
                                className='text-sm text-slate-400 flex items-start gap-2'>
                                <FaTimes className='text-yellow-500 mt-0.5' />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className='flex flex-wrap gap-2 pt-4 border-t border-slate-800'>
                        {(selectedTip.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className='px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-sm border border-slate-700'>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className='p-6 border-t border-slate-800 bg-slate-900/60 rounded-b-3xl flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {getProgress(selectedTip) === 100 ?
                          <FaTrophy className='text-2xl text-yellow-400' />
                        : <FaRunning className='text-2xl text-orange-400' />}
                        <div>
                          <p className='text-sm text-slate-300'>
                            {getProgress(selectedTip) === 100 ?
                              "Congratulations! You've completed this plan! 🎉"
                            : `${getProgress(selectedTip)}% complete — Keep going!`
                            }
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTip(null)}
                        className='px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-lg'>
                        Close
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HealthTips;
