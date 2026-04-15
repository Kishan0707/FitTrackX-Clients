import React from "react";

const StatCard = ({ title, value, icon, growth }) => {
  const shouldShowGrowth =
    growth !== undefined && growth !== null && growth !== "";

  return (
    <div className='flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-md sm:p-6'>
      <div className='min-w-0'>
        <h3 className='text-sm text-slate-500 dark:text-slate-400'>{title}</h3>
        <p className='mt-2 text-2xl font-bold wrap-break-word'>{value}</p>
        {shouldShowGrowth && (
          <p className='mt-1 text-sm text-green-400'>{growth}</p>
        )}
      </div>
      <div className='shrink-0 text-2xl text-slate-500 dark:text-slate-400'>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
