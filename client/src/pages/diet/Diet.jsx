import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Link } from "react-router-dom";
import API from "../../services/api";
import MealCard from "../../components/MealCard";
import MacroChart from "../../components/MacroChart";
import GrocerySuggestion from "../../components/GrocerySuggestion";

const Diet = ({ setDiet, diet }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const res = await API.get("/diet/today");
        if (res.status === 200) {
          setDiet(res.data.data);
        }
      } catch (err) {
        console.log(err);
        setDiet(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-lg">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Today's Diet</h1>
          <p className="text-gray-400">Track your daily nutrition intake</p>
        </div>
        <Link
          to="/coach/diet"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          + Add Meal
        </Link>
      </div>

      {diet && diet.meals && diet.meals.length > 0 ? (
        <>
          {/* Nutritional Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
              <div className="text-sm font-semibold opacity-90">
                Total Calories
              </div>
              <div className="text-3xl font-bold mt-2">
                {Math.round(diet.totalCalories)}
              </div>
              <div className="text-xs opacity-75 mt-2">kcal</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-lg shadow-lg text-white">
              <div className="text-sm font-semibold opacity-90">Protein</div>
              <div className="text-3xl font-bold mt-2">
                {Math.round(diet.totalProtein)}
              </div>
              <div className="text-xs opacity-75 mt-2">grams</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-lg shadow-lg text-white">
              <div className="text-sm font-semibold opacity-90">Carbs</div>
              <div className="text-3xl font-bold mt-2">
                {Math.round(diet.totalCarbs)}
              </div>
              <div className="text-xs opacity-75 mt-2">grams</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-6 rounded-lg shadow-lg text-white">
              <div className="text-sm font-semibold opacity-90">Fat</div>
              <div className="text-3xl font-bold mt-2">
                {Math.round(diet.totalFat)}
              </div>
              <div className="text-xs opacity-75 mt-2">grams</div>
            </div>
          </div>

          {/* Meals Section */}
          <div className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded mr-3"></span>
                  Meals
                </h2>
                <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold border border-blue-500/50">
                  {diet.meals.length} Meals
                </span>
              </div>

              {diet.meals && diet.meals.length > 0 ? (
                <div>
                  {/* Meal Type Tabs/Filter */}
                  <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-700">
                    {Array.from(new Set(diet.meals.map((m) => m.mealName))).map(
                      (mealType) => (
                        <span
                          key={mealType}
                          className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500/30 transition-colors cursor-pointer"
                        >
                          {mealType}
                        </span>
                      ),
                    )}
                  </div>

                  {/* Meals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diet.meals.map((meal, index) => (
                      <div key={meal._id || index} className="group">
                        <MealCard meal={meal} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No meals added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Charts & Suggestions Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-500 rounded mr-2"></span>
                Macro Distribution
              </h3>
              <MacroChart />
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-green-500 rounded mr-2"></span>
                Grocery Suggestions
              </h3>
              <GrocerySuggestion />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-2xl font-semibold text-white mb-2">
            No meals added yet
          </p>
          <p className="text-gray-400 mb-6">
            Start tracking your nutrition by adding your first meal
          </p>
          <Link
            to="/add-meal"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Add Your First Meal
          </Link>
        </div>
      )}
    </div>
  );
};

export default Diet;
