import React from "react";

const getMealColor = (mealName) => {
  const colors = {
    Breakfast: {
      bg: "from-orange-500/20 to-yellow-500/20",
      border: "border-orange-500/50",
      badge: "bg-orange-500/30 text-orange-300",
    },
    Lunch: {
      bg: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/50",
      badge: "bg-green-500/30 text-green-300",
    },
    Dinner: {
      bg: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/50",
      badge: "bg-blue-500/30 text-blue-300",
    },
    "Mid-Morning Snack": {
      bg: "from-pink-500/20 to-rose-500/20",
      border: "border-pink-500/50",
      badge: "bg-pink-500/30 text-pink-300",
    },
    "Afternoon Snack": {
      bg: "from-purple-500/20 to-indigo-500/20",
      border: "border-purple-500/50",
      badge: "bg-purple-500/30 text-purple-300",
    },
    "Pre-Workout": {
      bg: "from-red-500/20 to-orange-500/20",
      border: "border-red-500/50",
      badge: "bg-red-500/30 text-red-300",
    },
    "Post-Workout": {
      bg: "from-lime-500/20 to-green-500/20",
      border: "border-lime-500/50",
      badge: "bg-lime-500/30 text-lime-300",
    },
    "Late Night Snack": {
      bg: "from-slate-500/20 to-slate-600/20",
      border: "border-slate-500/50",
      badge: "bg-slate-500/30 text-slate-300",
    },
  };
  return colors[mealName] || colors["Lunch"];
};

const getMacroColor = (macro) => {
  const macroColors = {
    calories: "text-orange-300",
    protein: "text-blue-300",
    carbs: "text-green-300",
    fat: "text-yellow-300",
  };
  return macroColors[macro] || "text-gray-300";
};

const MealCard = ({ meal }) => {
  const color = getMealColor(meal.mealName);

  // Calculate totals for this meal
  const mealTotals = meal.foods.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div
      className={`bg-gradient-to-br ${color.bg} backdrop-blur-lg border ${color.border} rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-opacity-100`}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-white">{meal.mealName}</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${color.badge} border border-opacity-50`}
          >
            {meal.foods.length} item{meal.foods.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Meal Macro Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <div className="text-xs text-gray-400 font-semibold">Calories</div>
            <div className={`text-lg font-bold ${getMacroColor("calories")}`}>
              {Math.round(mealTotals.calories)}
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <div className="text-xs text-gray-400 font-semibold">Protein</div>
            <div className={`text-lg font-bold ${getMacroColor("protein")}`}>
              {Math.round(mealTotals.protein)}g
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <div className="text-xs text-gray-400 font-semibold">Carbs</div>
            <div className={`text-lg font-bold ${getMacroColor("carbs")}`}>
              {Math.round(mealTotals.carbs)}g
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <div className="text-xs text-gray-400 font-semibold">Fat</div>
            <div className={`text-lg font-bold ${getMacroColor("fat")}`}>
              {Math.round(mealTotals.fat)}g
            </div>
          </div>
        </div>
      </div>

      {/* Foods List */}
      <div className="p-5 space-y-3">
        {meal.foods.length > 0 ? (
          meal.foods.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {item.foodName}
                  </h3>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}g</p>
                </div>
                <span className="text-orange-300 font-bold text-sm">
                  {item.calories} cal
                </span>
              </div>

              {/* Macro Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Protein:</span>
                  <span className={`font-semibold ${getMacroColor("protein")}`}>
                    {item.protein}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Carbs:</span>
                  <span className={`font-semibold ${getMacroColor("carbs")}`}>
                    {item.carbs}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fat:</span>
                  <span className={`font-semibold ${getMacroColor("fat")}`}>
                    {item.fat}g
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              {(item.sugar > 0 || item.sodium > 0) && (
                <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-slate-700/50">
                  {item.sugar > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sugar:</span>
                      <span className="text-gray-300 font-semibold">
                        {item.sugar}g
                      </span>
                    </div>
                  )}
                  {item.sodium > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sodium:</span>
                      <span className="text-gray-300 font-semibold">
                        {item.sodium}mg
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">
            No foods added
          </p>
        )}
      </div>
    </div>
  );
};

export default MealCard;
