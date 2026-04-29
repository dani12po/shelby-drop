/**
 * Build a public share URL for a file.
 * Format: {baseUrl}/share/{wallet}/{filename}
 *
 * Anyone with this URL can preview and download the file
 * without connecting a wallet.
 */
export function buildShareUrl(wallet: string, fileName: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || (
    typeof window !== "undefined" ? window.location.origin : ""
  );
  const encoded = fileName.split("/").map(encodeURIComponent).join("/");
  return `${base}/share/${encodeURIComponent(wallet)}/${encoded}`;
}
