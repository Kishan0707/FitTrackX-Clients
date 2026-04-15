import React, { useContext, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaDollarSign,
  FaShieldAlt,
  FaShoppingBag,
  FaTimesCircle,
} from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import { AuthContext } from "../../context/authContext";

const PRICE_FIELDS = [
  { key: "originalPrice", label: "Original" },
  { key: "discountPrice", label: "Discount", hideWhenEmpty: true },
  { key: "gstAmount", label: "GST" },
  { key: "finalPrice", label: "Final" },
];

const formatCurrency = (value) => {
  const normalized =
    value === null || value === undefined || Number.isNaN(Number(value)) ?
      0
    : Number(value);
  return `₹${normalized.toFixed(2)}`;
};

const removeSymbol = (value) => formatCurrency(value).replace(/^₹/, "");

const statusMeta = {
  verified: {
    label: "Verified partner",
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    icon: <FaCheckCircle />,
  },
  pending: {
    label: "Pending verification",
    tone: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
    icon: <FaShieldAlt />,
  },
  rejected: {
    label: "Needs review",
    tone: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    icon: <FaTimesCircle />,
  },
};

const StatusBadge = ({ status }) => {
  const meta = statusMeta[status] || statusMeta.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${meta.tone}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
};

const PriceRow = ({ label, value, hideWhenEmpty }) => {
  const shouldHide = hideWhenEmpty && (value === null || value === undefined);
  return (
    <div className='flex items-center justify-between'>
      <span className='uppercase tracking-[0.3em]'>{label}</span>
      <span className='font-semibold text-white'>
        {shouldHide ? "—" : formatCurrency(value)}
      </span>
    </div>
  );
};

const PriceBreakdown = ({ product }) => (
  <div className='mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2'>
    {PRICE_FIELDS.map((field) => (
      <PriceRow
        key={field.key}
        label={field.label}
        value={product[field.key]}
        hideWhenEmpty={field.hideWhenEmpty}
      />
    ))}
  </div>
);

const PriceSummary = ({ product }) => (
  <div className='mt-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/40 via-slate-900/60 to-slate-900/40 p-4 text-sm text-slate-300 shadow-inner'>
    <div className='flex items-baseline justify-between gap-3'>
      <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
        Final price
      </p>
      <span className='text-3xl font-bold text-white'>
        {formatCurrency(product.finalPrice)}
      </span>
    </div>
    <p className='mt-1 text-xs text-slate-400'>
      Inclusive of GST ({product.gstRate ?? 18}%) · GST ₹
      {removeSymbol(product.gstAmount)}
    </p>
  </div>
);

const ProductCard = ({ product, onView }) => {
  const appliedStatus = product.status || "verified";
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.originalPrice;

  return (
    <div className='group relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-2 hover:border-white/30 hover:shadow-[0_30px_70px_rgba(0,0,0,0.8)]'>
      {/* 🔥 Discount Badge */}
      {hasDiscount && (
        <div className='absolute top-4 right-4 z-10 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg'>
          Save ₹{product.originalPrice - product.discountPrice}
        </div>
      )}

      {/* Status */}
      <StatusBadge status={appliedStatus} />

      {/* Header */}
      <div className='mt-3 flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
            {product.coach?.name ?
              `Coach ${product.coach.name}`
            : "Coach product"}
          </p>
          <h2 className='text-xl font-semibold text-white leading-snug line-clamp-2'>
            {product.name}
          </h2>
        </div>
      </div>

      {/* Image */}
      <div className='mt-4 relative overflow-hidden rounded-2xl group'>
        {/* Gradient Overlay (premium feel) */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10' />
        {product.discountPrice && (
          <div className='absolute top-3 right-3 z-20 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg'>
            SALE
          </div>
        )}
        {product.imageUrl ?
          <img
            src={product.imageUrl}
            alt={product.name}
            className='h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110'
          />
        : <div className='flex h-52 items-center justify-center bg-slate-900 text-slate-500'>
            No image
          </div>
        }

        {/* Floating Tag (🔥 Premium look) */}
        <div className='absolute bottom-3 left-3 z-20 rounded-lg bg-black/60 backdrop-blur px-3 py-1 text-xs text-white'>
          High Quality
        </div>
      </div>

      {/* Description */}
      <p className='mt-4 text-sm text-slate-400 line-clamp-2'>
        {product.description || "No description available"}
      </p>

      {/* Price Section */}
      <div className='mt-4 flex items-center justify-between'>
        <div>
          <p className='text-xs text-slate-500'>Final Price</p>
          <p className='text-2xl font-bold text-white'>
            {formatCurrency(product.finalPrice)}
          </p>

          {hasDiscount && (
            <p className='text-xs text-slate-500 line-through'>
              {formatCurrency(product.originalPrice)}
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => onView?.(product)}
          className='rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-red-700 active:scale-95'>
          View
        </button>
      </div>

      {/* Coach Instructions */}
      {product.instructions && (
        <div className='mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3'>
          <p className='text-[10px] uppercase text-slate-500'>Coach Tip</p>
          <p className='text-xs text-slate-300 line-clamp-2'>
            {product.instructions}
          </p>
        </div>
      )}

      {/* Footer Meta */}
      <div className='mt-4 flex justify-between text-[10px] text-slate-500 uppercase tracking-wider'>
        <span>Stock: {product.inventory ?? 0}</span>
        <span>GST {product.gstRate ?? 18}%</span>
      </div>
    </div>
  );
};

const CoachProductRow = ({ product }) => {
  const hasDiscount =
    product.discountPrice !== null && product.discountPrice !== undefined;
  return (
    <div className='rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.45)]'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-white'>{product.name}</h3>
          <p className='text-xs text-slate-400'>
            Added {new Date(product.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={product.status} />
      </div>
      <p className='mt-2 text-xs text-slate-400 line-clamp-2'>
        {product.description}
      </p>
      <PriceSummary product={product} />
      <PriceBreakdown product={product} />
      <div className='mt-3 flex flex-wrap gap-3 text-xs text-slate-400'>
        <span>Inventory {product.inventory ?? 0}</span>
        <span>GST {product.gstRate ?? 18}%</span>
      </div>
      {product.instructions && (
        <p className='mt-3 text-xs text-slate-300'>{product.instructions}</p>
      )}
      <div className='mt-3 flex items-center gap-2 text-[11px] text-slate-400'>
        <FaDollarSign className='text-red-400' />
        <span>
          {hasDiscount ?
            `Discounted from ${formatCurrency(product.originalPrice)}`
          : "No discount"}
        </span>
      </div>
    </div>
  );
};

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm'>
      <div className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.65)]'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
              {product.coach?.name ?
                `Coach ${product.coach.name}`
              : "Coach product"}
            </p>
            <h2 className='text-3xl font-semibold text-white'>
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='rounded-full border border-slate-700 px-3 py-1 text-sm uppercase tracking-[0.3em] text-slate-300 transition hover:border-white'>
            Close
          </button>
        </div>
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className='mt-4 h-64 w-full rounded-2xl object-cover'
          />
        )}
        <p className='mt-4 text-sm leading-relaxed text-slate-300'>
          {product.description}
        </p>
        <div className='mt-4 grid gap-3 text-xs text-slate-300 md:grid-cols-3'>
          <div className='rounded-2xl border border-slate-800 bg-slate-950/70 p-3'>
            <p className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>
              Original price
            </p>
            <p className='text-base font-semibold text-white'>
              {formatCurrency(product.originalPrice)}
            </p>
          </div>
          <div className='rounded-2xl border border-slate-800 bg-slate-950/70 p-3'>
            <p className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>
              GST
            </p>
            <p className='text-base font-semibold text-white'>
              {product.gstRate ?? 18}%
            </p>
          </div>
          <div className='rounded-2xl border border-slate-800 bg-slate-950/70 p-3'>
            <p className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>
              Final price
            </p>
            <p className='text-base font-semibold text-white'>
              {formatCurrency(product.finalPrice)}
            </p>
          </div>
        </div>
        <div className='mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-400'>
          <span>Inventory {product.inventory ?? 0}</span>
          <span>GST {product.gstRate ?? 18}%</span>
          <span>
            {product.instructions ?
              "Coach has usage tips"
            : "No tip provided yet"}
          </span>
        </div>
        {product.instructions && (
          <div className='mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300'>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>
              Coach instructions
            </p>
            <p className='mt-1 leading-relaxed text-white'>
              {product.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const initialFormState = {
  name: "",
  description: "",
  instructions: "",
  imageUrl: "",
  originalPrice: "",
  discountPrice: "",
  gstRate: 18,
  inventory: 0,
};

const ProductForm = ({ onSuccess }) => {
  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "gstRate" || name === "inventory" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.originalPrice) {
      setError("Please provide at least a product name and price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        instructions: form.instructions.trim(),
        imageUrl: form.imageUrl.trim() || null,
        originalPrice: Number(form.originalPrice),
        discountPrice:
          form.discountPrice ? Number(form.discountPrice) : undefined,
        gstRate: Number(form.gstRate) || 18,
        inventory: Number(form.inventory) || 0,
      };

      await API.post("/products", payload);
      setForm(initialFormState);
      onSuccess?.();
    } catch (submissionError) {
      console.error(submissionError);
      setError(
        submissionError?.response?.data?.message ||
          "Could not save your product right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6'>
      <div>
        <h2 className='text-lg font-semibold text-white'>
          Add a coach product
        </h2>
        <p className='mt-1 text-sm text-slate-400'>
          Share a nutrition or gear pickup that you personally endorse.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-1'>
          <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Product name
          </label>
          <input
            className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
            name='name'
            value={form.name}
            onChange={handleChange}
            placeholder='Protein powder stack'
            required
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Original price
          </label>
          <input
            type='number'
            step='0.01'
            className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
            name='originalPrice'
            value={form.originalPrice}
            onChange={handleChange}
            placeholder='5000'
            required
          />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='space-y-1'>
          <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Discounted price
          </label>
          <input
            type='number'
            step='0.01'
            className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
            name='discountPrice'
            value={form.discountPrice}
            onChange={handleChange}
            placeholder='4999'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            GST rate (%)
          </label>
          <input
            type='number'
            min='0'
            step='0.5'
            className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
            name='gstRate'
            value={form.gstRate}
            onChange={handleChange}
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Inventory
          </label>
          <input
            type='number'
            min='0'
            className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
            name='inventory'
            value={form.inventory}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-1'>
          <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
            Image URL
          </label>
          <input
            className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
            name='imageUrl'
            value={form.imageUrl}
            onChange={handleChange}
            placeholder='https://...jpg'
          />
        </div>
      </div>

      <div className='space-y-1'>
        <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
          Description
        </label>
        <textarea
          rows={2}
          className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
          name='description'
          value={form.description}
          onChange={handleChange}
          placeholder='Why this product works, what goal it supports.'
        />
      </div>

      <div className='space-y-1'>
        <label className='text-xs uppercase tracking-[0.3em] text-slate-400'>
          Coach instructions
        </label>
        <textarea
          rows={2}
          className='w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none'
          name='instructions'
          value={form.instructions}
          onChange={handleChange}
          placeholder='Share how clients should time or stack the product.'
        />
      </div>

      {error && <p className='text-xs text-rose-300'>{error}</p>}

      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-2xl bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'>
          {isSubmitting ? "Saving..." : "Submit for verification"}
        </button>
        <p className='text-xs text-slate-400'>
          An admin verifies live entries and GST is booked automatically.
        </p>
      </div>
    </form>
  );
};

const Products = () => {
  const { user } = useContext(AuthContext);
  const isCoach = user?.role === "coach";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coachProducts, setCoachProducts] = useState([]);
  const [loadingCoachProducts, setLoadingCoachProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachProducts = async () => {
    if (!isCoach) return;
    setLoadingCoachProducts(true);

    try {
      const res = await API.get("/products?mine=true");
      setCoachProducts(res.data.data || []);
    } catch (error) {
      console.error("Failed to load coach products:", error);
    } finally {
      setLoadingCoachProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchCoachProducts();
  }, [isCoach]);

  return (
    <DashboardLayout>
      <div className='space-y-6 mb-28'>
        <header className='space-y-2 text-white'>
          <p className='text-xs uppercase tracking-[0.4em] text-slate-500'>
            Coach store
          </p>
          <h1 className='text-3xl font-bold'>
            Products for your fitness stack
          </h1>
          <p className='text-sm text-slate-400'>
            GST-inclusive coach-curated picks with transparent pricing and usage
            tips.
          </p>
        </header>

        {isCoach && (
          <div className='space-y-5'>
            <ProductForm onSuccess={fetchCoachProducts} />

            <section className='space-y-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
                    My catalog
                  </p>
                  <h2 className='text-xl font-semibold text-white'>
                    Track verification and inventory
                  </h2>
                </div>
                <span className='text-xs text-slate-400'>
                  Total {coachProducts.length}
                </span>
              </div>
              {loadingCoachProducts ?
                <p className='text-sm text-slate-400'>
                  Loading your catalog...
                </p>
              : coachProducts.length === 0 ?
                <p className='text-sm text-slate-400'>
                  Add a product above to start sharing your toolkit.
                </p>
              : <div className='grid gap-4 md:grid-cols-2'>
                  {coachProducts.map((product) => (
                    <CoachProductRow key={product._id} product={product} />
                  ))}
                </div>
              }
            </section>
          </div>
        )}

        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>
                Available offers
              </p>
              <h2 className='text-2xl font-semibold text-white'>
                Buy ready-to-ship coach products
              </h2>
            </div>
            <div className='flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-slate-400'>
              <FaShoppingBag />
              GST friendly
            </div>
          </div>

          {loading ?
            <div className='flex h-48 items-center justify-center text-slate-400'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-red-500' />
            </div>
          : products.length === 0 ?
            <p className='text-sm text-slate-400'>
              No verified products available yet.
            </p>
          : <div className='grid gap-5 md:grid-cols-4'>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onView={(item) => setSelectedProduct(item)}
                />
              ))}
            </div>
          }
        </section>
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </DashboardLayout>
  );
};
export default Products;
