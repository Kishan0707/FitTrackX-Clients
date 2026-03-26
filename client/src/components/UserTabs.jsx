import React from "react";

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "banned", label: "Banned" },
];

const UserTabs = ({ summary, statusFilter, setStatusFilter }) => {
  const counts = {
    all: summary?.total || 0,
    active: summary?.active || 0,
    suspended: summary?.suspended || 0,
    banned: summary?.banned || 0,
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {TABS.map((tab) => {
        const isActive = statusFilter === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-red-500 bg-red-500 text-white"
                : "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        );
      })}
    </div>
  );
};

export default UserTabs;
