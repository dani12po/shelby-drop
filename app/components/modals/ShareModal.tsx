'use client'

export default function ShareModal({
  url,
  onClose,
}: {
  url: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-shelby-panel p-6 rounded-md w-[360px]">
        <h3 className="mb-2 text-lg">Share this file</h3>

        <input
          value={url}
          readOnly
          className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm mb-3"
        />

        <button
          onClick={() => navigator.clipboard.writeText(url)}
          className="w-full bg-shelby-accent hover:bg-shelby-accentHover py-2 rounded-md">
          Copy link
        </button>

        <button onClick={onClose} className="w-full text-sm text-shelby-muted mt-3">
          Close
        </button>
      </div>
    </div>
  )
}
