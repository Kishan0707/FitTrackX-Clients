import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaCheck,
  FaPlus,
  FaSearch,
  FaStore,
  FaTag,
  FaTimes,
  FaLeaf,
  FaEgg,
  FaAppleAlt,
  FaCheese,
  FaAtom,
  FaCookieBite,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";

// Enhanced grocery items with prices, images (emoji icons), and nutrition tags
const allItems = [
  {
    id: 1,
    name: "Fresh Milk",
    category: "Dairy",
    price: 45,
    unit: "L",
    icon: "🥛",
    tags: ["Calcium", "Protein"],
    inStock: true,
  },
  {
    id: 2,
    name: "Organic Paneer",
    category: "Protein",
    price: 180,
    unit: "200g",
    icon: "🧀",
    tags: ["High Protein", "Low Carb"],
    inStock: true,
  },
  {
    id: 3,
    name: "Farm Fresh Eggs",
    category: "Protein",
    price: 60,
    unit: "6 pcs",
    icon: "🥚",
    tags: ["Omega-3", "Vitamin D"],
    inStock: true,
  },
  {
    id: 4,
    name: "Banana",
    category: "Fruits",
    price: 40,
    unit: "dozen",
    icon: "🍌",
    tags: ["Potassium", "Energy"],
    inStock: true,
  },
  {
    id: 5,
    name: "Avocado",
    category: "Fruits",
    price: 150,
    unit: "piece",
    icon: "🥑",
    tags: ["Healthy Fats", "Fiber"],
    inStock: true,
  },
  {
    id: 6,
    name: "Oats",
    category: "Grains",
    price: 89,
    unit: "500g",
    icon: "🥣",
    tags: ["Fiber", "Gluten-Free"],
    inStock: true,
  },
  {
    id: 7,
    name: "Almonds",
    category: "Dry Fruits",
    price: 220,
    unit: "250g",
    icon: "🌰",
    tags: ["Vitamin E", "Magnesium"],
    inStock: true,
  },
  {
    id: 8,
    name: "Greek Yogurt",
    category: "Dairy",
    price: 120,
    unit: "500g",
    icon: "🍶",
    tags: ["Probiotics", "Protein"],
    inStock: true,
  },
  {
    id: 9,
    name: "Chicken Breast",
    category: "Protein",
    price: 280,
    unit: "500g",
    icon: "🍗",
    tags: ["Lean Protein", "Low Fat"],
    inStock: true,
  },
  {
    id: 10,
    name: "Spinach",
    category: "Vegetables",
    price: 30,
    unit: "bunch",
    icon: "🥬",
    tags: ["Iron", "Vitamin K"],
    inStock: true,
  },
  {
    id: 11,
    name: "Brown Rice",
    category: "Grains",
    price: 75,
    unit: "1kg",
    icon: "🍚",
    tags: ["Whole Grain", "Fiber"],
    inStock: true,
  },
  {
    id: 12,
    name: "Honey",
    category: "Sweeteners",
    price: 250,
    unit: "250ml",
    icon: "🍯",
    tags: ["Natural", "Antioxidants"],
    inStock: false,
  },
];

const categories = [
  "All",
  "Protein",
  "Fruits",
  "Dairy",
  "Grains",
  "Vegetables",
  "Dry Fruits",
  "Sweeteners",
];

const categoryIcons = {
  All: FaStore,
  Protein: FaEgg,
  Fruits: FaAppleAlt,
  Dairy: FaCheese,
  Grains: FaCookieBite,
  Vegetables: FaLeaf,
  "Dry Fruits": FaAtom,
  Sweeteners: FaTag,
};

const Grocery = () => {
  const [items] = useState(allItems);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filtered items based on category + search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = filter === "All" || item.category === filter;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchesCategory && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  // Cart totals
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  }, [cart]);

  const cartCount = cart.length;

  // ➕ ADD TO CART
  const addToCart = (item) => {
    if (!cart.find((c) => c.id === item.id)) {
      setCart([...cart, item]);
    }
  };

  // ❌ REMOVE
  const removeFromCart = (item) => {
    setCart(cart.filter((c) => c.id !== item.id));
  };

  // 🛒 BUY
  const handleBuy = () => {
    alert(`Order Placed Successfully! 🎉\nTotal: ₹${cartTotal}`);
    setCart([]);
    setIsCartOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 md:p-6 lg:p-8'>
        {/* Animated background orbs */}
        <div className='fixed top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse' />
        <div className='fixed bottom-20 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-[100px] -z-10 animate-pulse' />

        {/* 🔥 HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
          <div>
            <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'>
              Healthy Grocery Store 🛒
            </h1>
            <p className='text-slate-400 mt-1 text-sm'>
              Fresh produce delivered to your doorstep
            </p>
          </div>

          {/* Search */}
          <div className='relative w-full md:w-84 flex gap-9 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 border border-purple-400 p-2 rounded-2xl'>
            <div className=' relative flex items-center gap-2 text-purple-800 bg-purple-300/90 border border-purple-500 rounded-2xl p-3'>
              <FaShoppingCart />
              <span className='absolute -top-2 -right-3 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center'>
                {cartCount}
              </span>
            </div>
            <div className='relative'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-200' />
              <input
                type='text'
                placeholder='Search groceries...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/80 focus:border-purple-500/50 transition-all'
              />
            </div>
          </div>
        </motion.div>

        {/* 🛒 CART FLOATING BUTTON (mobile-friendly) */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCartOpen(true)}
          className='fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/40'>
          <FaShoppingCart className='text-white text-xl' />
          {cartCount > 0 && (
            <span className='absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center'>
              {cartCount}
            </span>
          )}
        </motion.button>

        {/* 🔥 FILTER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide'>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || FaTag;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat ?
                    "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 hover:border-purple-500/30"
                }`}>
                <Icon
                  className={filter === cat ? "text-white" : "text-purple-400"}
                />
                {cat}
              </button>
            );
          })}
        </motion.div>

        {/* 🔥 PRODUCTS GRID */}
        {filteredItems.length === 0 ?
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-20'>
            <div className='text-6xl mb-4'>🔍</div>
            <p className='text-slate-400'>
              No items found matching your criteria
            </p>
            <button
              onClick={() => {
                setFilter("All");
                setSearchQuery("");
              }}
              className='mt-4 px-6 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition'>
              Clear Filters
            </button>
          </motion.div>
        : <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c.id === item.id);
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`group relative flex flex-col p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                    item.inStock ?
                      "bg-white/[0.03] border-white/10 hover:border-purple-500/50 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]"
                    : "bg-white/[0.02] border-white/5 opacity-60"
                  }`}>
                  {/* Out-of-stock badge */}
                  {!item.inStock && (
                    <div className='absolute top-3 right-3 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium'>
                      Out of Stock
                    </div>
                  )}

                  {/* Icon + Name */}
                  <div className='flex items-start gap-4 mb-4'>
                    <div className='text-4xl md:text-5xl filter drop-shadow-lg'>
                      {item.icon}
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-white font-semibold text-lg group-hover:text-purple-300 transition-colors'>
                        {item.name}
                      </h3>
                      <span className='text-xs text-slate-400 uppercase tracking-wider'>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className='flex flex-wrap gap-1.5 mb-4'>
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className='px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 text-xs border border-purple-500/20'>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price + Add to Cart */}
                  <div className='mt-auto flex items-center justify-between pt-4 border-t border-white/5'>
                    <div>
                      <span className='text-xl font-bold text-white'>
                        ₹{item.price}
                      </span>
                      <span className='text-slate-500 text-sm'>
                        /{item.unit}
                      </span>
                    </div>

                    {inCart ?
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => removeFromCart(item)}
                        disabled={!item.inStock}
                        className='flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-md shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed'>
                        <FaCheck />
                        <span className='hidden sm:inline'>Added</span>
                      </motion.button>
                    : <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => addToCart(item)}
                        disabled={!item.inStock}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-md transition-all ${
                          item.inStock ?
                            "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30 hover:shadow-purple-500/50"
                          : "bg-slate-700 text-slate-400 cursor-not-allowed"
                        }`}>
                        <FaPlus />
                        <span className='hidden sm:inline'>Add</span>
                      </motion.button>
                    }
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        }

        {/* 🛒 CART SLIDE-OVER PANEL */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
              />

              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className='fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col'>
                {/* Header */}
                <div className='p-6 border-b border-white/10 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600'>
                      <FaShoppingCart className='text-white text-xl' />
                    </div>
                    <div>
                      <h2 className='text-xl font-bold text-white'>
                        Your Cart
                      </h2>
                      <p className='text-slate-400 text-sm'>
                        {cartCount} items
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className='p-2 rounded-lg hover:bg-white/10 transition-colors'>
                    <FaTimes className='text-slate-400' />
                  </button>
                </div>

                {/* Cart Items */}
                <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                  {cart.length === 0 ?
                    <div className='text-center py-12'>
                      <div className='text-5xl mb-3'>🛒</div>
                      <p className='text-slate-400'>Your cart is empty</p>
                      <p className='text-slate-500 text-sm mt-1'>
                        Add some healthy groceries!
                      </p>
                    </div>
                  : cart.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className='flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10'>
                        <span className='text-3xl'>{item.icon}</span>
                        <div className='flex-1'>
                          <h4 className='text-white font-medium'>
                            {item.name}
                          </h4>
                          <p className='text-slate-400 text-sm'>
                            ₹{item.price} / {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item)}
                          className='p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors'>
                          <FaTimes />
                        </button>
                      </motion.div>
                    ))
                  }
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                  <div className='p-6 border-t border-white/10 bg-white/[0.02]'>
                    {/* Subtotal */}
                    <div className='flex justify-between items-center mb-4'>
                      <span className='text-slate-400'>Subtotal</span>
                      <span className='text-2xl font-bold text-white'>
                        ₹{cartTotal}
                      </span>
                    </div>

                    {/* Delivery + Tax (fake) */}
                    <div className='flex justify-between items-center mb-4 text-sm text-slate-400'>
                      <span>Delivery + Tax</span>
                      <span>Included</span>
                    </div>

                    {/* Total */}
                    <div className='flex justify-between items-center mb-6 py-4 border-t border-white/10'>
                      <span className='text-white font-semibold'>Total</span>
                      <span className='text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent'>
                        ₹{cartTotal}
                      </span>
                    </div>

                    {/* Checkout button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuy}
                      className='w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 via-emerald-600 to-green-600 text-white font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all'>
                      Checkout Now 🚀
                    </motion.button>

                    <p className='text-center text-xs text-slate-500 mt-3'>
                      Secure payment • Fresh delivery guaranteed
                    </p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Grocery;
