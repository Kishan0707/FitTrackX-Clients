import React, { useEffect, useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { Link, useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const res = await API.get("/orders/my");
    setOrders(res.data.orders || []);
  };

  return (
    <DashboardLayout>
      <div className='p-4 md:p-6 space-y-6'>
        {/* 🔴 EMPTY STATE */}
        {orders.length === 0 && (
          <div className='text-center mt-16'>
            <h2 className='text-lg md:text-xl text-red-400'>
              No Orders Yet 😢
            </h2>

            <Link
              to='/products'
              className='mt-4 inline-block bg-purple-500 px-4 py-2 rounded hover:bg-purple-600 text-sm md:text-base'>
              Browse Products 🛒
            </Link>
          </div>
        )}

        {/* ✅ ORDERS GRID */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 '>
          {orders.map((order) => (
            <div
              key={order._id}
              className='bg-white/5 backdrop-blur-lg hover:scale-[1.02] p-4 rounded-2xl border border-white/10 hover:shadow-xl transition flex flex-col gap-4'>
              {/* 🖼️ IMAGE + INFO */}
              <div className='flex gap-4 items-center'>
                <img
                  src={order.productId?.imageUrl}
                  className='w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover'
                />

                <div className='flex-1 min-w-0'>
                  <h2 className='text-white text-sm sm:text-base font-semibold truncate'>
                    {order.productId?.name}
                  </h2>

                  <p className='text-purple-300 text-sm mt-1'>
                    ₹{order.total || order.price}
                  </p>

                  <p className='text-xs text-gray-400'>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* 🔥 STATUS + ACTION */}
              <div className='flex justify-between items-center flex-wrap gap-2'>
                <span
                  className={`px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                    order.status === "pending" ?
                      "bg-yellow-500/20 text-yellow-400"
                    : order.status === "delivered" ?
                      "bg-green-500/20 text-green-400"
                    : order.status === "cancelled" ?
                      "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                  }`}>
                  {order.status}
                </span>

                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className='text-xs sm:text-sm bg-blue-500 px-3 py-1 rounded hover:bg-blue-600'>
                  Track
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyOrders;
