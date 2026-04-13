import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { FaBan, FaCheck } from "react-icons/fa";

const AdminProducts = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/products/pending");
      setPendingProducts(res.data.data || []);
    } catch (fetchError) {
      console.error("Failed to load pending products", fetchError);
      setError("Unable to load pending requests right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const updateProcessing = (productId, value) => {
    setProcessing((prev) => ({ ...prev, [productId]: value }));
  };

  const handleDecision = async (productId, decision) => {
    updateProcessing(productId, true);
    setError("");
    try {
      const endpoint = decision === "accept" ? "verify" : "reject";
      await API.patch(`/products/${productId}/${endpoint}`);
      await fetchPending();
    } catch (decisionError) {
      console.error(decisionError);
      setError("Unable to update that request. Try again.");
    } finally {
      updateProcessing(productId, false);
    }
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <header className='space-y-2 text-white'>
          <p className='text-xs uppercase tracking-[0.4em] text-slate-500'>Admin store</p>
          <h1 className='text-3xl font-bold'>Coach product approvals</h1>
          <p className='text-sm text-slate-400'>Accept or reject submissions before they reach members.</p>
        </header>

        {error && (
          <div className='rounded-2xl border border-rose-500/80 bg-rose-900/40 p-4 text-sm text-rose-200'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='flex h-48 items-center justify-center text-slate-400'>
            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-red-500' />
          </div>
        ) : pendingProducts.length === 0 ? (
          <div className='rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm text-slate-400'>
            All coach products are verified. Nothing pending right now.
          </div>
        ) : (
          <div className='grid gap-5 lg:grid-cols-2'>
            {pendingProducts.map((product) => (
              <div
                key={product._id}
                className='rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.45)]'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
                      {product.coach?.name ? `Coach ${product.coach.name}` : "Coach"}
                    </p>
                    <h2 className='text-xl font-semibold text-white'>{product.name}</h2>
                  </div>
                  <div className='text-xs text-slate-400'>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className='mt-4 h-40 w-full rounded-2xl object-cover'
                  />
                )}
                <p className='mt-3 text-sm text-slate-300'>{product.description}</p>
                <div className='mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2'>
                  <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.35em]'>
                    <span>Original</span>
                    <span>₹{product.originalPrice?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.35em]'>
                    <span>GST</span>
                    <span>{product.gstRate ?? 18}%</span>
                  </div>
                </div>
                <p className='mt-3 text-xs text-slate-400'>Inventory: {product.inventory ?? 0} units</p>
                {product.instructions && (
                  <div className='mt-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-white'>
                    <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Coach tip</p>
                    <p className='text-sm'>{product.instructions}</p>
                  </div>
                )}
                <div className='mt-5 flex flex-wrap gap-3 text-xs'>
                  <button
                    type='button'
                    disabled={processing[product._id] === true}
                    onClick={() => handleDecision(product._id, "accept")}
                    className='flex items-center gap-2 rounded-2xl border border-emerald-500/60 bg-emerald-500/20 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-emerald-200 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60'>
                    <FaCheck className='text-sm' />
                    Verify and publish
                  </button>
                  <button
                    type='button'
                    disabled={processing[product._id] === true}
                    onClick={() => handleDecision(product._id, "reject")}
                    className='flex items-center gap-2 rounded-2xl border border-rose-500/60 bg-rose-500/10 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60'>
                    <FaBan className='text-sm' />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
