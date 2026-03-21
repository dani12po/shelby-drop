"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Copy, Check, ChevronDown, ExternalLink, Wallet, LogOut } from "lucide-react";

type Props = {
  connected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

const navItems = [
  { href: "/", label: "Explorer" },
  { href: "/guide", label: "Panduan" },
  { href: "/vision", label: "Visi Misi" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "Tentang" },
];

export default function Header({ connected, onConnect, onDisconnect }: Props) {
  const pathname = usePathname();
  const { account } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const currentWallet = account?.address.toString() || null;

  // Balance fetch
  useEffect(() => {
    if (!currentWallet) {
      setBalance(null);
      return;
    }

    setBalance(null);

    async function fetchBalance() {
      try {
        const res = await fetch(
          `https://api.shelbynet.shelby.xyz/v1/accounts/${currentWallet}/resources`
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
  }, [currentWallet]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: '64px',
          background: scrolled ? 'rgba(5,5,8,0.95)' : 'rgba(5,5,8,0.5)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>

          {/* KIRI: Logo saja */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.4rem' }}>⬡</span>
            <span style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Shelby Drop</span>
          </Link>

          {/* TENGAH: Nav links — desktop only */}
          <nav style={{ display: 'flex', gap: '32px' }} className="hidden md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontSize: '0.875rem',
                    color: isActive ? 'white' : '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* KANAN: Wallet + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Desktop: WalletConnect normal */}
            <div className="hidden md:block">
              {connected && onConnect ? (
                <div style={{ position: 'relative' }} ref={mobileMenuRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Green dot connected indicator */}
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#10b981', display: 'inline-block',
                      boxShadow: '0 0 6px #10b981'
                    }} />

                    {/* Short address */}
                    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {currentWallet ? `${currentWallet.slice(0, 6)}...${currentWallet.slice(-4)}` : 'Connected'}
                    </span>

                    {/* Copy icon */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(currentWallet || '');
                        setShowCopied(true);
                        setTimeout(() => setShowCopied(false), 2000);
                      }}
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px', borderRadius: '4px',
                        color: showCopied ? '#10b981' : '#94a3b8',
                        transition: 'color 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      {showCopied
                        ? <Check size={13} strokeWidth={2.5} />
                        : <Copy size={13} strokeWidth={2} />
                      }
                    </span>

                    {/* Chevron */}
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      style={{
                        color: '#94a3b8',
                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          right: 0,
                          width: '240px',
                          borderRadius: '12px',
                          background: 'rgba(15,15,23,0.98)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                          overflow: 'hidden',
                          zIndex: 100
                        }}
                      >
                        {/* Header address */}
                        <div style={{
                          padding: '14px 16px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <p style={{
                            fontSize: '0.7rem', color: '#475569',
                            margin: '0 0 4px', textTransform: 'uppercase',
                            letterSpacing: '0.08em', fontWeight: 600
                          }}>
                            Connected
                          </p>
                          <p style={{
                            fontSize: '0.78rem', color: '#94a3b8',
                            fontFamily: 'monospace', margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {currentWallet}
                          </p>
                        </div>

                        {/* Item 1: View on Explorer */}
                        <a
                          href={`https://explorer.shelby.xyz/shelbynet/account/${currentWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px', gap: '10px',
                            fontSize: '0.875rem', color: '#e2e8f0',
                            textDecoration: 'none',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <ExternalLink size={15} strokeWidth={1.8} color="#94a3b8" />
                            <span>View on Explorer</span>
                          </div>
                          <ExternalLink size={11} strokeWidth={1.5} color="#475569" />
                        </a>

                        {/* Item 2: Balance */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <Wallet size={15} strokeWidth={1.8} color="#94a3b8" />
                            <span style={{fontSize: '0.875rem', color: '#e2e8f0'}}>Balance</span>
                          </div>
                          <span style={{
                            fontSize: '0.875rem', fontFamily: 'monospace',
                            color: '#10b981', fontWeight: 600
                          }}>
                            {balance ?? (
                              <span style={{
                                display: 'inline-block', width: '60px', height: '12px',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.08)',
                                animation: 'shimmer 1.5s infinite'
                              }} />
                            )}
                          </span>
                        </div>

                        {/* Item 3: Disconnect */}
                        <button
                          onClick={() => {
                            if (onDisconnect) onDisconnect();
                            setDropdownOpen(false);
                          }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            gap: '10px', padding: '12px 16px',
                            fontSize: '0.875rem', color: '#f87171',
                            background: 'none', border: 'none', cursor: 'pointer',
                            textAlign: 'left', transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={15} strokeWidth={1.8} color="#f87171" />
                          Disconnect
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={onConnect}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: 'white',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                    <circle cx="18" cy="12" r="2" />
                  </svg>
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile: */}
            <div className="md:hidden">
              {!currentWallet ? (
                // Belum connect: tombol Connect Wallet
                <button
                  onClick={onConnect}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Connect
                </button>
              ) : (
                // Sudah connect: tombol dengan dropdown
                <div style={{ position: 'relative' }} ref={mobileMenuRef}>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {mobileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: 'absolute',
                          top: '48px',
                          right: 0,
                          width: '220px',
                          borderRadius: '12px',
                          background: 'rgba(15,15,23,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                          overflow: 'hidden',
                          zIndex: 100
                        }}
                      >
                        <div style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '4px' }}>Connected</div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {currentWallet}
                          </div>
                        </div>

                        {navItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                              display: 'block',
                              padding: '12px 16px',
                              fontSize: '0.875rem',
                              color: '#94a3b8',
                              textDecoration: 'none',
                              borderBottom: '1px solid rgba(255,255,255,0.04)'
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                        <a
                          href={`https://explorer.shelby.xyz/shelbynet/account/${currentWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 16px',
                            fontSize: '0.875rem',
                            color: '#f1f5f9',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={15} strokeWidth={1.8} color="#94a3b8" />
                          View on Explorer
                        </a>

                        {/* Balance */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <Wallet size={15} strokeWidth={1.8} color="#94a3b8" />
                            <span style={{fontSize: '0.875rem', color: '#e2e8f0'}}>Balance</span>
                          </div>
                          <span style={{
                            fontSize: '0.875rem', fontFamily: 'monospace',
                            color: '#10b981', fontWeight: 600
                          }}>
                            {balance ?? '...'}
                          </span>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                        <button
                          onClick={() => {
                            if (onDisconnect) onDisconnect();
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.875rem',
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut size={15} strokeWidth={1.8} color="#f87171" />
                          Disconnect
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
