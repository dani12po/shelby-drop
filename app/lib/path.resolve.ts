/* ===============================
   FILESYSTEM PATH RESOLVER
================================ */

export function resolveRelativePath(
  basePath: string[],
  relative: string
): string[] | null {
  // absolute (http, https, data)
  if (/^(https?:|data:)/.test(relative)) {
    return null;
  }

  const parts = relative.split("/").filter(Boolean);
  const resolved = [...basePath];

  for (const p of parts) {
    if (p === ".") continue;

    if (p === "..") {
      resolved.pop();
      continue;
    }

    resolved.push(p);
  }

  return resolved;
}
