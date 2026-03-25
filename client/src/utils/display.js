const toDisplayText = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    const combinedValue = value
      .map((item) => toDisplayText(item, ""))
      .filter(Boolean)
      .join(", ");

    return combinedValue || fallback;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.email ||
      value.title ||
      value.label ||
      value.description ||
      value.message ||
      value.role ||
      value._id ||
      value.id ||
      fallback
    );
  }

  return fallback;
};

const toDisplayDateTime = (value, fallback = "N/A") => {
  if (!value) return fallback;

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return fallback;
    }
    return date.toLocaleString();
  } catch {
    return fallback;
  }
};

export { toDisplayDateTime, toDisplayText };
