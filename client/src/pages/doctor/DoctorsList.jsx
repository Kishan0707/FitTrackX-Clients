import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaUserMd,
  FaMapMarkerAlt,
  FaStar,
  FaRupeeSign,
  FaClock,
} from "react-icons/fa";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const specialties = [
    "General Physician",
    "Cardiologist",
    "Nutritionist",
    "Endocrinologist",
    "Physiotherapist",
    "Psychiatrist",
  ];
  const locations = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Pune",
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const params = { search, specialty, location, priceRange };
        const res = await API.get(API_ENDPOINTS.DOCTORS.LIST, { params });
        setDoctors(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [search, specialty, location, priceRange]);

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950  md:p-8'>
        <div className='mx-auto max-w-7xl'>
          <h1 className='mb-8 text-3xl font-bold text-white'>Find a Doctor</h1>

          {/* Search & Filters */}
          <div className='mb-8 rounded-2xl border border-slate-700 bg-slate-900 p-6'>
            <div className='grid gap-4 md:grid-cols-5'>
              <div className='relative md:col-span-2'>
                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  type='text'
                  placeholder='Search by name, specialty...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none'
                />
              </div>

              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className='rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'>
                <option value=''>All Specialties</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className='rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'>
                <option value=''>All Locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className='rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'>
                <option value=''>Any Price</option>
                <option value='0-500'>Under ₹500</option>
                <option value='500-1000'>₹500 - ₹1000</option>
                <option value='1000+'>Above ₹1000</option>
              </select>
            </div>
          </div>

          {/* Doctor Cards */}
          {loading ?
            <div className='flex items-center justify-center py-20'>
              <div className='h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent'></div>
            </div>
          : doctors.length === 0 ?
            <div className='rounded-2xl border border-slate-700 bg-slate-900 p-12 text-center'>
              <FaUserMd className='mx-auto mb-4 text-4xl text-slate-600' />
              <p className='text-lg text-slate-400'>
                No doctors found matching your criteria.
              </p>
            </div>
          : <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className='overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg transition hover:border-orange-500/50'>
                  <div className='p-6'>
                    <div className='flex items-start gap-4'>
                      <div className='h-20 w-20 flex-shrink-0 rounded-xl bg-slate-800'>
                        {doctor.photo ?
                          <img
                            src={doctor.photo}
                            alt={doctor.name}
                            className='h-full w-full rounded-xl object-cover'
                          />
                        : <div className='flex h-full w-full rounded-xl items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white'>
                            {doctor.name?.charAt(0)}
                          </div>
                        }
                      </div>
                      <div className='flex-1'>
                        <Link
                          to={`/doctors/${doctor._id}`}
                          className='hover:text-orange-400'>
                          <h3 className='text-lg font-bold text-white'>
                            Dr. {doctor.name}
                          </h3>
                        </Link>
                        <p className='text-blue-400'>{doctor.specialty}</p>
                        <div className='mt-1 flex items-center gap-3 text-sm text-slate-400'>
                          <span className='flex items-center gap-1'>
                            <FaStar className='text-yellow-400' />
                            {doctor.rating || "4.5"} ({doctor.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className='mt-3 line-clamp-2 text-sm text-slate-300'>
                      {doctor.bio}
                    </p>

                    <div className='mt-4 flex flex-wrap gap-2'>
                      {doctor.services?.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className='rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300'>
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className='mt-4 flex items-center justify-between border-t border-slate-700 pt-4'>
                      <div className='flex items-center gap-4 text-sm text-slate-400'>
                        {doctor.location && (
                          <span className='flex items-center gap-1'>
                            <FaMapMarkerAlt className='text-slate-500' />
                            {doctor.location}
                          </span>
                        )}
                        {doctor.experience && (
                          <span className='flex items-center gap-1'>
                            <FaClock className='text-slate-500' />
                            {doctor.experience}y
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-1 text-orange-400 font-semibold'>
                        <FaRupeeSign />
                        {doctor.consultationFee || 500}
                      </div>
                    </div>

                    <div className='mt-4 flex gap-2'>
                      <Link
                        to={`/doctors/${doctor._id}`}
                        className='flex-1 rounded-xl bg-orange-500 py-2 text-center font-semibold text-white hover:bg-orange-600 transition'>
                        View Profile
                      </Link>
                      <Link
                        to={`/book-appointment?doctor=${doctor._id}`}
                        className='flex-1 rounded-xl border border-slate-600 bg-slate-800 py-2 text-center font-semibold text-white hover:bg-slate-700 transition'>
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorsList;
