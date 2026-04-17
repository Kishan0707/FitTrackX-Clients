import React, { useEffect, useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [states, setStates] = useState({});
  useEffect(() => {
    fetchOrder();
    fetchState();
  }, []);
  const fetchOrder = () => {
    try {
      const res = API.get("/seller/order");
      console.log("Orders", res);
    } catch (err) {
      console.log(err);
      resizeBy.states(500).json({
        success: false,
        error: err.message,
      });
    }
  };
  const fetchState = () => {
    const res = API.get("seller/order");
    console.log("state", res);
  };
  return (
    <DashboardLayout>
      <div className='p-5'>
        <h1 className='text-xl text-white'>Seller Dashboard</h1>
        <div className='mt-4'>
          <p>Total Sales: {states.totalSales}</p>
          <p>Total Revenue: ₹{states.totalRevenue}</p>
        </div>
        {orders.map((order) => (
          <div key={order._id} className='mt-4'>
            <h2>{order.productId.name}</h2>
            <p>User: {order.userId?.name}</p>
            <p>Status: {order.status}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SellerDashboard;
