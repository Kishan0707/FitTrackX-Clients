import React, { useEffect, useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await API.get("/orders/my");
    console.log(res);
    setOrders(res.data.orders);
  };

  return (
    <DashboardLayout>
      <div className='p-6 space-y-4'>
        {orders.length === 0 && (
          <div className='max-w-4xl mx-auto mb-6 px-4'>
            <div className='justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg animate-bounce border border-red-400 flex items-center'>
              <span className='font-semibold'>
                ⚠️ Empty cart {orders.length}
              </span>
            </div>
          </div>
        )}
        {orders.map((order) => (
          <div
            key={order._id}
            className='bg-white/5 p-4 rounded-xl border border-white/10'>
            <h2 className='text-white'>{order.productId.name}</h2>

            <p className='text-purple-300'>₹{order.totalAmount}</p>

            <span className='text-green-400'>{order.status}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default MyOrders;
