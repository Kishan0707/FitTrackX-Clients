import { useState } from "react";
import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import Diet from "./Diet";

const AddMeal = () => {
  const mealOptions = [
    "Breakfast",
    "Mid-Morning Snack",
    "Lunch",
    "Afternoon Snack",
    "Pre-Workout",
    "Post-Workout",
    "Dinner",
    "Late Night Snack",
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    mealName: "",
    foodName: "",
    calories: "",
    protein: "",
    carbs: "", // Fixed typo: cabs -> carbs
    fat: "",
    quantity: "", // Added quantity
  });
  const [diet, setDiet] = useState(null); // Changed to null for better handling

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.mealName ||
      !formData.foodName ||
      !formData.calories ||
      !formData.protein ||
      !formData.carbs ||
      !formData.fat
    ) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await API.post("/diet", {
        meals: [
          // Fixed: meal -> meals
          {
            mealName: formData.mealName,
            foods: [
              // Added foods array
              {
                foodName: formData.foodName,
                quantity: parseFloat(formData.quantity) || 1, // Added quantity, default 1
                calories: parseFloat(formData.calories),
                protein: parseFloat(formData.protein),
                carbs: parseFloat(formData.carbs), // Fixed: cabs -> carbs
                fat: parseFloat(formData.fat),
                sugar: 0, // Added, default 0
                sodium: 0, // Added, default 0
              },
            ],
          },
        ],
      });
      setDiet(res.data.data); // Store the created diet

      setSuccess("Meal Added Successfully"); // Fixed: set to string
      setFormData({
        mealName: "",
        foodName: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        quantity: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Diet error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Server is not responding",
      ); // Fixed message
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout>
      {/* Notifications */}
      {error && (
        <div className="fixed top-20 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-red-400/50 backdrop-blur-lg z-50 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="fixed top-20 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-400/50 backdrop-blur-lg z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span className="font-semibold">{success}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Form Container */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <span className="text-5xl">🍽️</span>
              Add Meal
            </h1>
            <p className="text-blue-100 text-sm">
              Track your nutrition intake throughout the day
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Meal Type Section */}
            <div className="mb-8">
              <label className="block text-white font-bold mb-3 text-lg">
                <span className="inline-block bg-blue-500 text-white rounded-full w-8 h-8 text-center leading-8 mr-2 text-sm">
                  1
                </span>
                Select Meal Type
              </label>
              <select
                className="w-full bg-slate-800 border-2 border-slate-600 hover:border-blue-500 focus:border-blue-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                name="mealName"
                onChange={handleChange}
                value={formData.mealName}
                required
              >
                <option value="">Choose a meal type...</option>
                {mealOptions.map((meal) => (
                  <option key={meal} value={meal}>
                    {meal}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Details Section */}
            <div className="mb-8">
              <label className="block text-white font-bold mb-3 text-lg">
                <span className="inline-block bg-blue-500 text-white rounded-full w-8 h-8 text-center leading-8 mr-2 text-sm">
                  2
                </span>
                Food Details
              </label>
              <input
                type="text"
                className="w-full bg-slate-800 border-2 border-slate-600 hover:border-blue-500 focus:border-blue-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                name="foodName"
                onChange={handleChange}
                value={formData.foodName}
                placeholder="e.g., Chicken Breast, Apple, Rice"
                required
              />
              <input
                type="number"
                className="w-full bg-slate-800 border-2 border-slate-600 hover:border-blue-500 focus:border-blue-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                name="quantity"
                onChange={handleChange}
                value={formData.quantity}
                placeholder="Quantity in grams (e.g., 100)"
                required
              />
            </div>

            {/* Nutritional Information Section */}
            <div className="mb-8">
              <label className="block text-white font-bold mb-4 text-lg">
                <span className="inline-block bg-blue-500 text-white rounded-full w-8 h-8 text-center leading-8 mr-2 text-sm">
                  3
                </span>
                Nutritional Information
              </label>

              {/* Main Macros Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Calories */}
                <div>
                  <label className="text-orange-300 text-sm font-semibold mb-2 block">
                    Calories (kcal)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-slate-800 border-2 border-orange-500/30 hover:border-orange-500 focus:border-orange-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      name="calories"
                      onChange={handleChange}
                      value={formData.calories}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Quantity Units - inline counter */}
                <div>
                  <label className="text-blue-300 text-sm font-semibold mb-2 block">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border-2 border-blue-500/30 hover:border-blue-500 focus:border-blue-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    name="protein"
                    onChange={handleChange}
                    value={formData.protein}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Secondary Macros Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Carbs */}
                <div>
                  <label className="text-green-300 text-sm font-semibold mb-2 block">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border-2 border-green-500/30 hover:border-green-500 focus:border-green-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    name="carbs"
                    onChange={handleChange}
                    value={formData.carbs}
                    placeholder="0"
                    required
                  />
                </div>

                {/* Fat */}
                <div>
                  <label className="text-yellow-300 text-sm font-semibold mb-2 block">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-800 border-2 border-yellow-500/30 hover:border-yellow-500 focus:border-yellow-500 rounded-xl p-4 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                    name="fat"
                    onChange={handleChange}
                    value={formData.fat}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding Meal...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Add Meal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-lg">
          <p className="text-blue-200 text-sm flex items-start gap-3">
            <span className="text-xl">💡</span>
            <span>
              Pro tip: You can find nutritional information on food packaging or
              use online databases like MyFitnessPal or USDA FoodData Central.
            </span>
          </p>
        </div>
      </div>

      {/* Diet Display Section */}
      <div className="mt-8">
        <Diet setDiet={setDiet} diet={diet} />
      </div>
    </DashboardLayout>
  );
};

export default AddMeal;
