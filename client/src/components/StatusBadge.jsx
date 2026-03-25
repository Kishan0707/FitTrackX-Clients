import React from "react";
import { normalizeStatus } from "../utils/moderation";

const STATUS_STYLES = {
  active: "bg-green-500/20 text-green-300 border border-green-500/30",
  suspended: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  banned: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const formatLabel = (status) => {
  if (!status) return "Active";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = normalizeStatus(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[normalizedStatus]}`}
    >
      {formatLabel(normalizedStatus)}
    </span>
  );
};

export default StatusBadge;
