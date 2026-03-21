import { SHELBY_EXPLORER_BASE } from "./shelbyExplorer";

export async function fetchAccount(address: string) {
  const res = await fetch(
    `${SHELBY_EXPLORER_BASE}/accounts/${address}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    // Return empty account jika tidak ditemukan
    return { address, sequence_number: "0", authentication_key: address };
  }

  return res.json();
}

export async function fetchTransactions(address: string) {
  const res = await fetch(
    `${SHELBY_EXPLORER_BASE}/accounts/${address}/transactions?limit=25`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return []; // Return empty array, jangan throw
  }

  return res.json();
}

// NEW: Fetch account resources untuk cek blobs
export async function fetchAccountResources(address: string) {
  const res = await fetch(
    `${SHELBY_EXPLORER_BASE}/accounts/${address}/resources`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];
  return res.json();
}
