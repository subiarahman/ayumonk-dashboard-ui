export function loadEntityRows(storageKey, initialRows) {
  if (typeof window === "undefined") return initialRows;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return initialRows;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialRows;

    return parsed.map((row, index) => ({
      id: String(row?.id || index + 1),
      ...row,
    }));
  } catch {
    return initialRows;
  }
}

export function saveEntityRows(storageKey, rows) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(rows));
}

export function buildEmptyForm(fields) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.name] = "";
    return accumulator;
  }, {});
}
