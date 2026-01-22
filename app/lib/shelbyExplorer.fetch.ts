import { SHELBY_EXPLORER_BASE } from "./shelbyExplorer";

export async function fetchAccount(address: string) {
  const res = await fetch(
    `${SHELBY_EXPLORER_BASE}/accounts/${address}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Wallet not found");
  }

  return res.json();
}

export async function fetchTransactions(address: string) {
  const res = await fetch(
    `${SHELBY_EXPLORER_BASE}/accounts/${address}/transactions?limit=25`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return res.json();
}
