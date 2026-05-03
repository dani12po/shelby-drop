'use client'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-10 h-10 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Loading...
        </p>
      </div>
    </div>
  )
}
