/* ===============================
   JSON SEARCH UTIL
================================ */

export function jsonContainsQuery(
  value: unknown,
  query: string
): boolean {
  if (!query) return true;

  const q = query.toLowerCase();

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value)
      .toLowerCase()
      .includes(q);
  }

  if (Array.isArray(value)) {
    return value.some((v) =>
      jsonContainsQuery(v, query)
    );
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.entries(value).some(
      ([k, v]) =>
        k.toLowerCase().includes(q) ||
        jsonContainsQuery(v, query)
    );
  }

  return false;
}
