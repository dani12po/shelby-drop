"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 480) {
        setColumns(1);
      } else if (window.innerWidth < 768) {
        setColumns(2);
      } else {
        setColumns(4);
      }
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: columns === 1 ? '1fr' : columns === 2 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: '48px',
    paddingBottom: '48px'
  };

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '64px 24px 32px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Grid columns */}
        <div style={gridStyle}>
          
          {/* Kolom 1: Brand + Social */}
          <div>
            <div style={{
              fontWeight: 700, 
              fontSize: '1.1rem', 
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⬡</span> Shelby Drop
            </div>
            <p style={{
              fontSize: '0.875rem', 
              color: 'var(--text-muted)', 
              lineHeight: 1.6,
              maxWidth: '240px',
              marginBottom: '16px'
            }}>
              Decentralized file storage on Aptos blockchain via Shelby Network.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href="https://x.com/Iq_dani26" 
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter/X"
                style={{
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px',
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://github.com/dani12po/shelby-drop" 
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                style={{
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px',
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <Github size={18} />
              </a>
              <a 
                href="https://www.linkedin.com/in/imam-qolandani-070373149/" 
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                style={{
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px',
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--text-secondary)', 
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Kolom 2: Product */}
          <div>
            <h4 style={{
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              marginBottom: '16px'
            }}>
              Product
            </h4>
            <ul style={{
              listStyle: 'none', 
              padding: 0, 
              margin: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px'
            }}>
              <li><Link href="/" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Explorer</Link></li>
              <li><Link href="/guide" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Panduan</Link></li>
              <li><Link href="/faq" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</Link></li>
              <li><Link href="/about" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Tentang</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Resources */}
          <div>
            <h4 style={{
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              marginBottom: '16px'
            }}>
              Resources
            </h4>
            <ul style={{
              listStyle: 'none', 
              padding: 0, 
              margin: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px'
            }}>
              <li><a href="https://docs.shelby.xyz" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Docs</a></li>
              <li><a href="https://developers.shelby.xyz" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Developer Portal</a></li>
              <li><a href="https://github.com/shelby/shelby-quickstart" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Quick Start</a></li>
              <li><a href="https://explorer.shelby.xyz/shelbynet" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Shelby Explorer</a></li>
              <li><a href="https://github.com/shelby/feedback/issues/new/choose" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Bug Report</a></li>
            </ul>
          </div>

          {/* Kolom 4: Info */}
          <div>
            <h4 style={{
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              marginBottom: '16px'
            }}>
              Info
            </h4>
            <ul style={{
              listStyle: 'none', 
              padding: 0, 
              margin: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px'
            }}>
              <li><Link href="/about" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Tentang</Link></li>
              <li><Link href="/vision" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Visi Misi</Link></li>
              <li><Link href="/faq" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</Link></li>
              <li><Link href="/guide" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Panduan</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* Bottom bar */}
        <div style={{
          paddingTop: '24px',
          paddingBottom: '24px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Kiri */}
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            © {currentYear} Shelby Drop. All rights reserved.
          </span>

          {/* Tengah — KREATOR */}
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Created by{' '}
            <a href="https://x.com/Iq_dani26" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Dani.xyz
            </a>
            {' '}with ❤️ | Shelby Network
          </span>

          {/* Kanan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', 
              height: '8px', 
              borderRadius: '50%',
              background: 'var(--accent-green)',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--accent-green)' }}>Network Active</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
