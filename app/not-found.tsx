"use client";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <a 
          href="/" 
          className="px-6 py-3 bg-white text-black rounded-full hover:bg-white/90 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
