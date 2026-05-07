import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaPrescription,
  FaSave,
  FaTrashAlt,
} from "react-icons/fa";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const EMPTY_MED = { name: "", dosage: "", frequency: "" };

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const { prescriptionId } = useParams();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(
    searchParams.get("patientId") || "",
  );
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [medicines, setMedicines] = useState([{ ...EMPTY_MED }]);
  const [notes, setNotes] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get(API_ENDPOINTS.DOCTORS.PATIENTS);
        if (res.data?.success) {
          setPatients(res.data.data || []);
          if (!selectedPatientId && res.data.data?.length > 0) {
            setSelectedPatientId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch patient list:", err);
      }
    };

    const fetchPrescription = async () => {
      if (!prescriptionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(
          API_ENDPOINTS.DOCTORS.PRESCRIPTION_DETAIL(prescriptionId),
        );
        const data = res.data.data;
        setSelectedPatientId(data.patientId?._id || data.patientId || "");
        setSelectedPatientName(data.patientId?.name || data.patientName || "");
        setMedicines(
          data.medicines?.length > 0 ? data.medicines : [{ ...EMPTY_MED }],
        );
        setNotes(data.notes || "");
        setIsEmergency(data.isEmergency || false);
        setStatus(data.status || "active");
      } catch (err) {
        console.error("Failed to load prescription:", err);
        setError(err.response?.data?.message || "Could not load prescription");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
    fetchPrescription();
  }, [prescriptionId, selectedPatientId]);

  useEffect(() => {
    if (!selectedPatientId || patients.length === 0) return;
    const patient = patients.find((item) => item._id === selectedPatientId);
    setSelectedPatientName(patient?.name || "");
  }, [selectedPatientId, patients]);

  const updateMedicine = (index, field, value) => {
    setMedicines((prev) =>
      prev.map((med, idx) =>
        idx === index ? { ...med, [field]: value } : med,
      ),
    );
  };

  const addMedicine = () => {
    setMedicines((prev) => [...prev, { ...EMPTY_MED }]);
  };

  const removeMedicine = (index) => {
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError("Please select a patient before saving.");
      return;
    }

    const payload = {
      userId: selectedPatientId,
      medicines: medicines.filter((med) => med.name.trim()),
      notes,
      isEmergency,
      status,
    };

    if (payload.medicines.length === 0) {
      setError("Add at least one medicine to save the prescription.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (prescriptionId) {
        await API.put(
          API_ENDPOINTS.DOCTORS.PRESCRIPTION_UPDATE(prescriptionId),
          payload,
        );
        setSuccess("Prescription updated successfully.");
      } else {
        await API.post(API_ENDPOINTS.DOCTORS.PRESCRIBE, payload);
        setSuccess("Prescription created successfully.");
      }
      setTimeout(() => navigate("/doctor/prescriptions"), 800);
    } catch (err) {
      console.error("Failed to save prescription:", err);
      setError(err.response?.data?.message || "Failed to save prescription.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-950 p-4 md:p-8'>
        <div className='mx-auto max-w-5xl space-y-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <button
                onClick={() => navigate("/doctor/prescriptions")}
                className='mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-orange-500 hover:text-white'>
                <FaArrowLeft /> Back to Prescriptions
              </button>
              <h1 className='text-3xl font-bold text-white'>
                {prescriptionId ? "Edit Prescription" : "New Prescription"}
              </h1>
              <p className='text-slate-400'>
                Create or update a prescription for your patient.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <button
                onClick={addMedicine}
                className='rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600'>
                <FaPlus /> Add Medicine
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className='rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60'>
                <FaSave /> {prescriptionId ? "Update" : "Save"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='rounded-3xl border border-slate-700 bg-slate-900 p-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-300'>
                    Patient
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'>
                    <option value=''>Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name || patient.email || patient._id}
                      </option>
                    ))}
                  </select>
                  {selectedPatientName && (
                    <p className='mt-2 text-sm text-slate-400'>
                      Selected patient: {selectedPatientName}
                    </p>
                  )}
                </div>
                <div>
                  <label className='mb-2 block text-sm font-semibold text-slate-300'>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'>
                    <option value='active'>Active</option>
                    <option value='completed'>Completed</option>
                    <option value='emergency'>Emergency</option>
                  </select>
                </div>
              </div>

              <div className='mt-6 flex items-center gap-4'>
                <input
                  id='emergency'
                  type='checkbox'
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className='h-4 w-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500'
                />
                <label htmlFor='emergency' className='text-sm text-slate-300'>
                  Mark as emergency prescription
                </label>
              </div>
            </div>

            <div className='rounded-3xl border border-slate-700 bg-slate-900 p-6'>
              <div className='mb-4 flex items-center justify-between gap-4'>
                <h2 className='text-xl font-semibold text-white'>Medicines</h2>
                <button
                  type='button'
                  onClick={addMedicine}
                  className='rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600'>
                  <FaPlus /> Add Row
                </button>
              </div>
              <div className='space-y-4'>
                {medicines.map((medicine, index) => (
                  <div
                    key={index}
                    className='grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]'>
                    <input
                      type='text'
                      value={medicine.name}
                      onChange={(e) =>
                        updateMedicine(index, "name", e.target.value)
                      }
                      placeholder='Medicine name'
                      className='rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                      required
                    />
                    <input
                      type='text'
                      value={medicine.dosage}
                      onChange={(e) =>
                        updateMedicine(index, "dosage", e.target.value)
                      }
                      placeholder='Dosage'
                      className='rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                    />
                    <input
                      type='text'
                      value={medicine.frequency}
                      onChange={(e) =>
                        updateMedicine(index, "frequency", e.target.value)
                      }
                      placeholder='Frequency'
                      className='rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                    />
                    <button
                      type='button'
                      onClick={() => removeMedicine(index)}
                      className='rounded-2xl bg-red-500 px-4 py-3 text-white transition hover:bg-red-600'>
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-3xl border border-slate-700 bg-slate-900 p-6'>
              <label className='mb-2 block text-sm font-semibold text-slate-300'>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className='w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-orange-500 focus:outline-none'
                placeholder='Instructions, diet notes, follow-up guidance...'
              />
            </div>

            {error && (
              <div className='rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300'>
                {error}
              </div>
            )}
            {success && (
              <div className='rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300'>
                {success}
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrescriptionForm;
