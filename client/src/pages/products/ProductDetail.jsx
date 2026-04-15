import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const res = await API.get(`/products/${id}`);
    setProduct(res.data.product);
  };

  const handleBuy = async () => {
    const referralCode = localStorage.getItem("refCode");

    await API.post("/orders", {
      productId: product._id,
      referralCode,
    });

    alert("Order placed 🚀");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className='p-6'>
      <img src={product.imageUrl} className='w-60 rounded' />

      <h1 className='text-xl text-white mt-3'>{product.name}</h1>

      <p className='text-purple-300'>₹{product.finalPrice}</p>

      <button
        onClick={handleBuy}
        className='mt-3 bg-green-500 px-4 py-2 rounded'>
        Buy Now
      </button>
    </div>
  );
};

export default ProductDetail;
