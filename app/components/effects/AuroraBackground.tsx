'use client'

/**
 * Background — dark & light mode.
 * Pure CSS, no JS animations, no hydration issues.
 * Controlled entirely by data-theme on <html>.
 */

export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        overflow: 'hidden', pointerEvents: 'none',
      }}
    >
      <style>{`
        /* ── Keyframes ── */
        @keyframes bgPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.07); }
        }
        @keyframes bgDrift {
          0%, 100% { transform: translateX(-5vw); }
          50%       { transform: translateX(5vw); }
        }
        @keyframes bgFloat {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(-3vh); opacity: 0.8; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.85; }
        }

        /* ── Sky base ── */
        [data-theme="dark"]  .bg-sky {
          background: linear-gradient(160deg, #020b18 0%, #030f22 45%, #04122a 100%);
        }
        [data-theme="light"] .bg-sky {
          background: linear-gradient(160deg, #dde8ff 0%, #eef2ff 45%, #f0f4ff 100%);
        }

        /* ── Blob colors ── */
        [data-theme="dark"]  .bg-blob-1 {
          background: radial-gradient(circle, rgba(10,20,90,0.65) 0%, rgba(5,10,55,0.28) 55%, transparent 80%);
          animation: bgPulse 22s ease-in-out infinite;
        }
        [data-theme="dark"]  .bg-blob-2 {
          background: radial-gradient(circle, rgba(55,10,130,0.5) 0%, rgba(30,5,80,0.2) 55%, transparent 80%);
          animation: bgDrift 26s ease-in-out infinite;
        }
        [data-theme="dark"]  .bg-blob-3 {
          background: radial-gradient(circle, rgba(0,60,160,0.35) 0%, rgba(0,30,100,0.15) 55%, transparent 80%);
          animation: bgFloat 18s ease-in-out 3s infinite;
        }

        [data-theme="light"] .bg-blob-1 {
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(79,70,229,0.08) 55%, transparent 80%);
          animation: bgPulse 22s ease-in-out infinite;
        }
        [data-theme="light"] .bg-blob-2 {
          background: radial-gradient(circle, rgba(124,58,237,0.14) 0%, rgba(109,40,217,0.06) 55%, transparent 80%);
          animation: bgDrift 26s ease-in-out infinite;
        }
        [data-theme="light"] .bg-blob-3 {
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(29,78,216,0.05) 55%, transparent 80%);
          animation: bgFloat 18s ease-in-out 3s infinite;
        }

        /* ── Stars: visible in dark, hidden in light ── */
        [data-theme="dark"]  .bg-stars { opacity: 1; animation: starTwinkle 5s ease-in-out infinite alternate; }
        [data-theme="light"] .bg-stars { opacity: 0; }

        /* ── Dot grid ── */
        [data-theme="dark"]  .bg-grid {
          background-image: radial-gradient(rgba(120,160,255,0.06) 1px, transparent 1px);
        }
        [data-theme="light"] .bg-grid {
          background-image: radial-gradient(rgba(79,70,229,0.07) 1px, transparent 1px);
        }
      `}</style>

      {/* Sky */}
      <div className="bg-sky" style={{ position: 'absolute', inset: 0 }} />

      {/* Blobs */}
      <div className="bg-blob-1" style={{
        position: 'absolute', top: '-8%', left: '-8%',
        width: '65vw', height: '65vw', borderRadius: '50%',
        filter: 'blur(72px)',
      }} />
      <div className="bg-blob-2" style={{
        position: 'absolute', top: '18%', right: '-5%',
        width: '52vw', height: '52vw', borderRadius: '50%',
        filter: 'blur(66px)',
      }} />
      <div className="bg-blob-3" style={{
        position: 'absolute', bottom: '5%', left: '-5%',
        width: '38vw', height: '38vw', borderRadius: '50%',
        filter: 'blur(56px)',
      }} />

      {/* Stars (dark only) */}
      <div className="bg-stars" style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 14% 8%,  rgba(220,235,255,0.9) 0%, transparent 100%),
          radial-gradient(1px 1px at 73% 5%,  rgba(220,235,255,0.7) 0%, transparent 100%),
          radial-gradient(2px 2px at 38% 12%, rgba(220,235,255,0.9) 0%, transparent 100%),
          radial-gradient(1px 1px at 91% 9%,  rgba(220,235,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 5%  22%, rgba(220,235,255,0.8) 0%, transparent 100%),
          radial-gradient(2px 2px at 55% 18%, rgba(220,235,255,0.9) 0%, transparent 100%),
          radial-gradient(1px 1px at 82% 25%, rgba(220,235,255,0.65)0%, transparent 100%),
          radial-gradient(1px 1px at 27% 30%, rgba(220,235,255,0.7) 0%, transparent 100%),
          radial-gradient(2px 2px at 66% 33%, rgba(255,215,140,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 11% 38%, rgba(220,235,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 48% 42%, rgba(220,235,255,0.8) 0%, transparent 100%),
          radial-gradient(2px 2px at 88% 40%, rgba(220,235,255,0.75)0%, transparent 100%),
          radial-gradient(1px 1px at 33% 48%, rgba(255,215,140,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 77% 52%, rgba(220,235,255,0.65)0%, transparent 100%),
          radial-gradient(2px 2px at 20% 55%, rgba(220,235,255,0.85)0%, transparent 100%),
          radial-gradient(1px 1px at 60% 58%, rgba(220,235,255,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 95% 62%, rgba(220,235,255,0.6) 0%, transparent 100%),
          radial-gradient(2px 2px at 42% 65%, rgba(255,215,140,0.75)0%, transparent 100%),
          radial-gradient(1px 1px at 8%  70%, rgba(220,235,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 72%, rgba(220,235,255,0.65)0%, transparent 100%),
          radial-gradient(1px 1px at 25% 78%, rgba(220,235,255,0.7) 0%, transparent 100%),
          radial-gradient(2px 2px at 85% 80%, rgba(220,235,255,0.85)0%, transparent 100%),
          radial-gradient(1px 1px at 50% 85%, rgba(255,215,140,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 16% 90%, rgba(220,235,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 63% 92%, rgba(220,235,255,0.75)0%, transparent 100%)
        `,
      }} />

      {/* Dot grid */}
      <div className="bg-grid" style={{
        position: 'absolute', inset: 0,
        backgroundSize: '40px 40px',
      }} />

    </div>
  )
}
