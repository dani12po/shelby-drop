export type RetentionStatus =
  | { state: "none" }
  | { state: "active"; label: string; msLeft: number }
  | { state: "expired" };

export function getRetentionStatus(
  expiresAt?: string
): RetentionStatus {
  if (!expiresAt) {
    return { state: "none" };
  }

  const now = Date.now();
  const expires = new Date(expiresAt).getTime();

  if (Number.isNaN(expires)) {
    return { state: "none" };
  }

  const diff = expires - now;

  if (diff <= 0) {
    return { state: "expired" };
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let label = "";
  if (days > 0) label = `${days}d`;
  else if (hours > 0) label = `${hours}h`;
  else label = `${minutes}m`;

  return {
    state: "active",
    label,
    msLeft: diff,
  };
}
