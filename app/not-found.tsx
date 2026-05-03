'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white text-center p-6 relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} 
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* 404 number */}
        <div className="text-[clamp(6rem,20vw,10rem)] font-extrabold leading-none mb-4 tracking-tighter bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
          404
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Halaman tidak ditemukan
        </h1>

        <p className="text-slate-400 mb-10 max-w-[360px] leading-relaxed text-base">
          Halaman yang kamu cari tidak ada atau
          sudah dipindahkan ke alamat lain.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/" 
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Kembali ke Home
          </Link>
          <Link 
            href="/guide" 
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
          >
            Lihat Panduan
          </Link>
        </div>
      </div>
    </div>
  )
}
