import React, { useEffect, useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { Link } from "react-router-dom";
const ProductList = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await API.get("/products");
    console.log(res);
    setProducts(res.data.data || []);
  };
  return (
    <DashboardLayout>
      <h1 className='text-2xl'>Products List</h1>
      <div className='p-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        {products.map((product) => (
          <div
            className='bg-slate-900 p-4 rounded-xl border border-slate-800 hover:shadow-lg transition-all duration-300 '
            key={product._id}>
            <img
              src={product.imageUrl}
              alt=''
              className='h-40 w-full object-cover rounded'
            />
            <h2 className='text-white mt-2'>{product.name}</h2>
            <p className='text-purple-400'>₹{product.finalPrice}</p>
            <Link
              to={`/product/${product._id}`}
              className='block mt-2 bg-purple-500 text-center py-1 rounded hover:bg-purple-600 transition'>
              View
            </Link>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ProductList;
