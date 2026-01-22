type Props = {
  blob: {
    data: string;
  };
  onClose: () => void;
};

export default function BlobModal({ blob, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-4 w-full max-w-lg">
        <h3 className="font-semibold mb-2">Blob Data</h3>

        <pre className="bg-gray-100 p-2 text-xs overflow-auto max-h-64">
          {blob.data}
        </pre>

        <div className="flex justify-end mt-4">
          <button
            className="px-3 py-1 border rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
