import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const steps = [
  "pending",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    const res = await API.get(`/orders/${id}`);
    setOrder(res.data.order);
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!order) return <p className='text-white'>Loading...</p>;

  return (
    <DashboardLayout>
      <div className='md:p-6 text-white max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl'>
        {/* PRODUCT */}
        <div className='flex gap-4 items-center mb-6'>
          <img src={order.productId?.imageUrl} className='w-20 h-20 rounded' />
          <div>
            <h1 className='text-xl font-bold'>{order.productId?.name}</h1>
            <p className='text-purple-400'>₹{order.price}</p>
          </div>
        </div>

        {/* ETA */}
        <div className='bg-purple-500/10 p-4 rounded mb-6'>
          <p className='text-gray-400 text-sm'>Estimated Delivery</p>
          <p className='text-purple-400 font-bold'>
            {new Date(order.estimatedDelivery).toDateString()}
          </p>
        </div>

        {/* TIMELINE */}
        <div className='border-l-2 border-gray-600 pl-4'>
          {steps.map((step, i) => {
            const active = steps.indexOf(order.status) >= i;

            return (
              <div key={step} className='mb-6 relative'>
                <div
                  className={`w-3 h-1 absolute -left-3 top-2 ${active ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
                />
                <div
                  className={`absolute  w-5 h-5 rounded-full ${
                    active ? "bg-green-500 animate-pulse" : "bg-gray-500"
                  }`}
                />

                <p
                  className={`capitalize px-7 ${
                    active ? "text-green-400" : "text-gray-400"
                  }`}>
                  {step.replaceAll("_", " ")}
                </p>
              </div>
            );
          })}
        </div>

        {/* MAP MOCK */}
        <div className='mt-8 bg-black/30 p-4 rounded'>
          <p className='text-gray-400 text-sm'>Delivery Tracking</p>
          <div className='h-40 flex items-center justify-center bg-gray-700 rounded mt-2'>
            📍 Map Coming Soon
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
