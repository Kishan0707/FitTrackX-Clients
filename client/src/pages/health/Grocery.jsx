import React, { useState } from "react";
import { FaShoppingCart, FaCheck, FaPlus } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";

const suggestions = [
  { name: "Milk", category: "Dairy" },
  { name: "Paneer", category: "Protein" },
  { name: "Banana", category: "Fruits" },
  { name: "Oats", category: "Healthy" },
  { name: "Almonds", category: "Dry Fruits" },
];

const categories = ["All", "Protein", "Fruits", "Dairy", "Healthy"];

const Grocery = () => {
  const [items, setItems] = useState(suggestions);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState("All");

  // ➕ ADD TO CART
  const addToCart = (item) => {
    if (!cart.find((c) => c.name === item.name)) {
      setCart([...cart, item]);
    }
  };

  // ❌ REMOVE
  const removeFromCart = (item) => {
    setCart(cart.filter((c) => c.name !== item.name));
  };

  // 🎯 FILTER
  const filteredItems =
    filter === "All" ? items : items.filter((item) => item.category === filter);

  // 🛒 BUY
  const handleBuy = () => {
    alert("Order Placed 🚀");
    setCart([]);
  };

  return (
    <DashboardLayout>
      <div className='p-6 space-y-6'>
        {/* 🔥 HEADER */}
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-white'>Grocery Store 🛒</h1>

          <div className='flex items-center gap-2 text-purple-400'>
            <FaShoppingCart />
            <span>{cart.length}</span>
          </div>
        </div>

        {/* 🔥 FILTER */}
        <div className='flex gap-2 flex-wrap'>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                filter === cat ?
                  "bg-purple-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-purple-500/20"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* 🔥 PRODUCTS */}
        <div className='grid md:grid-cols-2 gap-4'>
          {filteredItems.map((item, index) => {
            const inCart = cart.find((c) => c.name === item.name);

            return (
              <div
                key={index}
                className='group p-4 rounded-2xl border bg-white/5 border-white/10 backdrop-blur-md 
              hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 active:scale-95'>
                <div className='flex justify-between items-center'>
                  {/* NAME */}
                  <div>
                    <p className='text-white font-medium group-hover:text-purple-300'>
                      {item.name}
                    </p>
                    <span className='text-xs text-gray-400'>
                      {item.category}
                    </span>
                  </div>

                  {/* BUTTON */}
                  {inCart ?
                    <button
                      onClick={() => removeFromCart(item)}
                      className='px-3 py-1 text-sm rounded bg-green-500 text-white'>
                      <FaCheck />
                    </button>
                  : <button
                      onClick={() => addToCart(item)}
                      className='px-3 py-1 text-sm rounded bg-purple-500 hover:bg-purple-600'>
                      <FaPlus />
                    </button>
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* 🛒 CART */}
        {cart.length > 0 && (
          <div className='mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md'>
            <h2 className='text-lg text-white mb-3'>Cart</h2>

            {cart.map((item, i) => (
              <div key={i} className='flex justify-between text-gray-300 mb-2'>
                <span>{item.name}</span>
                <button onClick={() => removeFromCart(item)}>❌</button>
              </div>
            ))}

            <button
              onClick={handleBuy}
              className='mt-3 w-full py-2 rounded bg-green-500 hover:bg-green-600 active:scale-95 transition'>
              Buy Now 🚀
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Grocery;
