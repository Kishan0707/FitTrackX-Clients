import React, { useMemo, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";

const tips = [
  {
    id: 1,
    title: "Hair Fall",
    category: "hair",
    tags: ["hair", "protein", "nutrition"],

    summary:
      "Hair fall is often caused by protein deficiency, stress, and poor scalp care.",

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
  },

  {
    id: 2,
    title: "Acne",
    category: "skin",
    tags: ["skin", "oil", "hormones"],

    summary:
      "Acne happens due to excess oil, clogged pores, and hormonal imbalance.",

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
  },

  {
    id: 3,
    title: "Weight Gain (Muscle)",
    category: "fitness",
    tags: ["fitness", "muscle", "bulk"],

    summary:
      "Healthy weight gain requires calorie surplus + strength training.",

    causes: ["Low calorie intake", "Fast metabolism", "Skipping meals"],

    solution: [
      "Eat every 3 hours",
      "Add calorie-dense foods",
      "Strength training 4–5x/week",
      "Take whey protein",
    ],

    diet: [
      "Rice, roti, potatoes",
      "Paneer, milk, peanut butter",
      "Banana shake",
    ],

    lifestyle: ["Sleep 7–8 hours", "Track calories", "Consistency"],

    avoid: ["Skipping meals", "Only cardio", "Low protein diet"],

    impact: "Muscle Gain • Strength • Size",
  },

  {
    id: 4,
    title: "Low Energy",
    category: "lifestyle",
    tags: ["energy", "sleep", "stress"],

    summary:
      "Low energy is mainly due to poor sleep, dehydration, and bad diet.",

    causes: [
      "Sleep deprivation",
      "Dehydration",
      "Poor nutrition",
      "Excess screen time",
    ],

    solution: [
      "Drink 3L water daily",
      "Sleep 7–8 hours",
      "Take short breaks",
      "Eat balanced meals",
    ],

    diet: ["Fruits, nuts", "Complex carbs (oats, rice)", "Protein-rich food"],

    lifestyle: ["Limit screen time", "Morning sunlight", "Daily movement"],

    avoid: ["Late night scrolling", "Junk food", "Skipping breakfast"],

    impact: "Energy • Focus • Productivity",
  },
];

const HealthTips = () => {
  const [search, setSearch] = useState("");
  const [selectedTip, setSelectedTip] = useState(null);
  const [activeTag, setActiveTag] = useState("all");

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
  return (
    <DashboardLayout>
      <div className='space-y-8'>
        <header className='space-y-3 text-white'>
          <p className='text-xs uppercase tracking-[0.4em] text-slate-500'>
            Health cues
          </p>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>Daily rituals</h1>
              <p className='text-sm text-slate-400'>
                Coach-approved fixes for the small habits that move the needle.
              </p>
            </div>
            <div className='flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-slate-300'>
              <span className='rounded-full bg-slate-900/70 px-3 py-1 text-slate-300 shadow-inner'>
                {filteredTips.length} active tips
              </span>
              <span className='rounded-full bg-slate-900/70 px-3 py-1 text-slate-300 shadow-inner'>
                {activeTag === "all" ? "All categories" : `#${activeTag}`}
              </span>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <input
              value={search}
              onChange={(evt) => setSearch(evt.target.value)}
              type='search'
              placeholder='Search problems (hair, skin, energy...)'
              className='flex-1 min-w-[220px] rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none'
            />
          </div>
          <div className='space-y-3'>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
              🔥 Popular Problems
            </p>

            <div className='flex gap-3 overflow-x-auto pb-2'>
              {popularProblems.map((problem) => (
                <button
                  key={problem}
                  onClick={() => setSearch(problem)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300
        ${
          search === problem ?
            "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg scale-105"
          : "bg-slate-900/70 text-slate-300 border border-slate-800 hover:border-red-500/50 hover:scale-105"
        }`}>
                  <span className='text-lg'>
                    {problem === "Hair Fall" && "💇"}
                    {problem === "Acne" && "🧴"}
                    {problem === "Weight Gain" && "💪"}
                    {problem === "Low Energy" && "⚡"}
                  </span>

                  <span className='text-xs uppercase tracking-wide'>
                    {problem}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {filteredTips.map((tip) => (
            <div
              key={tip.title}
              className='group relative flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition duration-300 hover:-translate-y-2 hover:border-red-500/40'>
              {/* 🔥 Top Highlight Strip */}

              {/* Header */}
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-white group-hover:text-red-400 transition'>
                  {tip.title}
                </h2>

                {/* Impact Badge */}
                <span className='text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/30'>
                  {tip.impact}
                </span>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-2'>
                {tip.tags.map((tag) => (
                  <span
                    key={tag}
                    className='text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-300 uppercase tracking-wide'>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Summary */}
              <p className='text-sm text-slate-400 line-clamp-3'>
                {tip.summary}
              </p>

              {/* CTA */}
              <button
                onClick={() => setSelectedTip(tip)}
                className='mt-auto rounded-xl bg-gradient-to-r from-red-600 to-orange-500 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:scale-105 active:scale-95'>
                View Full Solution →
              </button>
            </div>
          ))}
        </div>

        {selectedTip && (
          <div className='fixed inset-0 z-90 flex items-center justify-center bg-black/70 p-6'>
            <div className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_35px_80px_rgba(0,0,0,0.75)]'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <h3 className='text-2xl font-semibold text-white'>
                    {selectedTip.title}
                  </h3>
                  <p className='text-xs uppercase tracking-[0.4em] text-slate-500'>
                    {selectedTip.impact}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTip(null)}
                  className='rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300 transition hover:border-white'>
                  Close
                </button>
              </div>
              <div className='mt-4 space-y-4 text-sm text-slate-300'>
                {/* Causes */}
                <div>
                  <h4 className='text-white font-semibold mb-1'>📌 Causes</h4>
                  <ul className='list-disc pl-5 space-y-1'>
                    {selectedTip.causes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div>
                  <h4 className='text-white font-semibold mb-1'>
                    ✅ Solutions
                  </h4>
                  <ul className='list-disc pl-5 space-y-1'>
                    {selectedTip.solution.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Diet */}
                <div>
                  <h4 className='text-white font-semibold mb-1'>🥗 Diet</h4>
                  <ul className='list-disc pl-5 space-y-1'>
                    {selectedTip.diet.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Lifestyle */}
                <div>
                  <h4 className='text-white font-semibold mb-1'>
                    💤 Lifestyle
                  </h4>
                  <ul className='list-disc pl-5 space-y-1'>
                    {selectedTip.lifestyle.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Avoid */}
                <div>
                  <h4 className='text-white font-semibold mb-1'>🚫 Avoid</h4>
                  <ul className='list-disc pl-5 space-y-1'>
                    {selectedTip.avoid.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-slate-400'>
                {selectedTip.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full border border-slate-800 px-3 py-1'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HealthTips;
