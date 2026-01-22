type Props = {
  wallet: {
    address: string;
    txCount: number;
    lastActivity: string;
  };
};

export default function WalletSummary({ wallet }: Props) {
  return (
    <div className="border rounded p-4 mt-6">
      <h2 className="font-semibold mb-2">Wallet Summary</h2>

      <div className="text-sm space-y-1">
        <div><b>Address:</b> {wallet.address}</div>
        <div><b>Total Transactions:</b> {wallet.txCount}</div>
        <div><b>Last Activity:</b> {wallet.lastActivity}</div>
      </div>
    </div>
  );
}
