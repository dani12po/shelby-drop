"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Copy, Check, ChevronDown, ExternalLink, Wallet, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NetworkSwitcher from "@/components/ui/NetworkSwitcher";
import { useTheme } from "@/hooks/useTheme";
import { useNetwork } from "@/hooks/useNetwork";
import { getNetworkConfig } from "@/config/shelby";

type Props = {
  connected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

const navItems = [
  { href: "/explorer", label: "Explorer" },
  { href: "/guide", label: "Panduan" },
  { href: "/vision", label: "Visi Misi" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "Tentang" },
];

export default function Header({ connected, onConnect, onDisconnect }: Props) {
  const pathname = usePathname();
  const { account } = useWallet();
  const { isDark } = useTheme();
  const { network } = useNetwork();
  const networkConfig = getNetworkConfig(network);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const currentWallet = account?.address.toString() || null;

  // Balance fetch
  useEffect(() => {
    if (!currentWallet) {
      setBalance(null);
      return;
    }

    async function fetchBalance() {
      try {
        const res = await fetch(
          `${networkConfig.aptosNodeUrl}/accounts/${currentWallet}/resources`
        );
        if (!res.ok) {
          setBalance('0 APT');
          return;
        }
        const data = await res.json();
        const coinStore = data.find(
          (r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
        );
        const raw = coinStore?.data?.coin?.value ?? '0';
        const apt = (parseInt(raw) / 1e8).toFixed(4);
        setBalance(`${apt} APT`);
      } catch {
        setBalance('0 APT');
      }
    }

    fetchBalance();
  }, [currentWallet, networkConfig.aptosNodeUrl]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled 
          ? 'bg-[var(--bg-navbar)] backdrop-blur-xl border-b border-[var(--border)] shadow-lg shadow-[var(--glow)]' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">

        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline group">
          <span className="text-2xl transition-transform group-hover:rotate-12">⬡</span>
          <span className="font-bold text-lg bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] bg-clip-text text-transparent">
            Shelby Drop
          </span>
        </Link>

        {/* CENTER: Nav links — desktop only */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-[var(--text-primary)] ${
                  isActive ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Desktop Only Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <NetworkSwitcher />
            
            {connected ? (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-accent)] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]" />
                  <span className="font-mono text-sm">
                    {currentWallet ? `${currentWallet.slice(0, 6)}...${currentWallet.slice(-4)}` : 'Connected'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[var(--text-secondary)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-[calc(100%+8px)] right-0 w-60 rounded-xl bg-[var(--bg-dropdown)] border border-[var(--border)] backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
                    >
                      <div className="p-4 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Connected</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(currentWallet || '');
                              setShowCopied(true);
                              setTimeout(() => setShowCopied(false), 2000);
                            }}
                            className={`p-1 rounded hover:bg-[var(--bg-card-hover)] transition-colors ${showCopied ? 'text-[var(--accent-green)]' : 'text-[var(--text-secondary)]'}`}
                          >
                            {showCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-mono truncate">
                          {currentWallet}
                        </p>
                      </div>

                      <div className="py-1">
                        <a
                          href={`${networkConfig.shelbyExplorerBase}/account/${currentWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <ExternalLink size={14} className="text-[var(--text-secondary)]" />
                            <span>View on Explorer</span>
                          </div>
                        </a>

                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
                          <div className="flex items-center gap-2.5">
                            <Wallet size={14} className="text-[var(--text-secondary)]" />
                            <span className="text-sm">Balance</span>
                          </div>
                          <span className="text-sm font-mono text-[var(--accent-green)] font-semibold">
                            {balance ?? '...'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onDisconnect?.();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--accent-red)] hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
              >
                <Wallet size={16} />
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            
            {connected ? (
              <div className="relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <AnimatePresence>
                  {mobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 right-0 w-[280px] rounded-xl bg-[var(--bg-dropdown)] border border-[var(--border)] backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
                    >
                      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-card)]/50">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Connected Wallet</p>
                        <p className="text-xs text-[var(--text-secondary)] font-mono truncate mb-2">
                          {currentWallet}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet size={12} className="text-[var(--text-secondary)]" />
                            <span className="text-xs font-mono text-[var(--accent-green)]">{balance ?? '...'}</span>
                          </div>
                          <NetworkSwitcher />
                        </div>
                      </div>

                      <nav className="py-2 border-b border-[var(--border)]">
                        {navItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-3 text-sm transition-colors ${
                              pathname === item.href ? 'text-[var(--text-primary)] bg-[var(--bg-card-hover)]' : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>

                      <div className="py-2">
                        <a
                          href={`${networkConfig.shelbyExplorerBase}/account/${currentWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)]"
                        >
                          <ExternalLink size={16} className="text-[var(--text-secondary)]" />
                          View on Explorer
                        </a>
                        <button
                          onClick={() => {
                            onDisconnect?.();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--accent-red)] text-left"
                        >
                          <LogOut size={16} />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white text-xs font-bold shadow-lg shadow-purple-500/20"
              >
                Connect
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
