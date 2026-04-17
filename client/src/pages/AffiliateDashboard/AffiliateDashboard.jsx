import React, { useEffect, useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const AffiliateDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await API.get("/affiliate/me");
    setData(res.data);
  };

  if (!data) return <p>Loading...</p>;

  const refLink = `${window.location.origin}/products?ref=${data.referralCode}`;

  return (
    <DashboardLayout>
      <div className='p-6'>
        <h1>Affiliate Dashboard</h1>

        <p>Earnings: ₹{data.earnings}</p>
        <p>Sales: {data.totalSales}</p>
        <p>Clicks: {data.clicks}</p>

        <input value={refLink} readOnly className='w-full mt-3' />
      </div>
    </DashboardLayout>
  );
};

export default AffiliateDashboard;
