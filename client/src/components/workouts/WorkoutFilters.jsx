const filters = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const WorkoutFilters = ({ activeFilter, onChange }) => {
  return (
    <div className='flex flex-wrap gap-2'>
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onChange?.(filter.key)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            activeFilter === filter.key
              ? "bg-orange-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}>
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default WorkoutFilters;
