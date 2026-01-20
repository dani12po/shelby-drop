import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shelby Drop",
  description: "Decentralized file sharing on Aptos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white min-h-screen flex flex-col">
        {/* ================= HEADER ================= */}
        <header className="border-b border-white/10 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">
              Shelby Drop
            </h1>
            <span className="text-xs text-gray-400">
              Web3 File Explorer
            </span>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
          {children}
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-gray-500 flex justify-between">
            <span>© {new Date().getFullYear()} Shelby Drop</span>
            <span>Powered by Shelby & Aptos</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
