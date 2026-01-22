export type BlobItem = {
  txHash: string;
  size: number;
  timestamp: string;
  data: string;
};

export function extractBlobs(transactions: any[]): BlobItem[] {
  const blobs: BlobItem[] = [];

  transactions.forEach(tx => {
    // Payload arguments
    tx.payload?.arguments?.forEach((arg: any) => {
      if (
        typeof arg === "string" &&
        (arg.startsWith("0x") || arg.length > 200)
      ) {
        blobs.push({
          txHash: tx.hash,
          size: arg.length,
          timestamp: tx.timestamp,
          data: arg,
        });
      }
    });

    // Events
    tx.events?.forEach((event: any) => {
      if (
        typeof event.data === "string" &&
        event.data.length > 200
      ) {
        blobs.push({
          txHash: tx.hash,
          size: event.data.length,
          timestamp: tx.timestamp,
          data: event.data,
        });
      }
    });
  });

  return blobs;
}
