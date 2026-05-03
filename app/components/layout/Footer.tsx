"use client";

import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] px-6 py-16 pb-8 mt-auto">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Grid columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12">
          
          {/* Kolom 1: Brand + Social */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="font-bold text-[1.1rem] mb-2 bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
              <span>⬡</span> Shelby Drop
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[240px] mb-4">
              Decentralized file storage on Aptos blockchain via Shelby Network.
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              <a 
                href="https://x.com/Iq_dani26" 
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter/X"
                className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-200"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://github.com/dani12po/shelby-drop" 
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-200"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://www.linkedin.com/in/imam-qolandani-070373149/" 
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-200"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Kolom 2: Product */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[0.75rem] font-semibold text-[var(--text-primary)] uppercase tracking-widest mb-4">
              Product
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li><Link href="/" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Explorer</Link></li>
              <li><Link href="/guide" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Panduan</Link></li>
              <li><Link href="/faq" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Tentang</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Resources */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[0.75rem] font-semibold text-[var(--text-primary)] uppercase tracking-widest mb-4">
              Resources
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li><a href="https://docs.shelby.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Docs</a></li>
              <li><a href="https://developers.shelby.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Developer Portal</a></li>
              <li><a href="https://github.com/shelby/shelby-quickstart" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Quick Start</a></li>
              <li><a href="https://explorer.shelby.xyz/testnet" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Shelby Explorer</a></li>
              <li><a href="https://github.com/dani12po/shelby-drop/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Bug Report</a></li>
            </ul>
          </div>

          {/* Kolom 4: Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-[0.75rem] font-semibold text-[var(--text-primary)] uppercase tracking-widest mb-4">
              Info
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li><Link href="/about" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Tentang</Link></li>
              <li><Link href="/vision" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Visi Misi</Link></li>
              <li><Link href="/faq" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">FAQ</Link></li>
              <li><Link href="/guide" className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--accent)] transition-colors">Panduan</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center flex-wrap gap-4">
          {/* Kiri */}
          <span className="text-sm text-[var(--text-muted)] text-center md:text-left">
            © {currentYear} Shelby Drop. All rights reserved.
          </span>

          {/* Tengah — KREATOR */}
          <span className="text-sm text-[var(--text-secondary)] text-center">
            Created by{' '}
            <a href="https://x.com/Iq_dani26" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-semibold no-underline hover:brightness-110 transition-all">
              Dani.xyz
            </a>
            {' '}with ❤️ | Shelby Network
          </span>

          {/* Kanan */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
            <span className="text-sm text-[var(--accent-green)]">Network Active</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
