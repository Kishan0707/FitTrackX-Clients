const normalizeStatus = (statusValue) => {
  const normalized = String(statusValue || "active").toLowerCase();

  if (normalized === "suspend") return "suspended";
  if (normalized === "ban") return "banned";
  if (!["active", "suspended", "banned"].includes(normalized)) {
    return "active";
  }

  return normalized;
};

export { normalizeStatus };
