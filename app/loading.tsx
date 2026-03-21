export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050508'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Animated hexagon loader */}
        <div style={{
          width: '60px',
          height: '60px',
          position: 'relative',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8b5cf6' }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
              </linearGradient>
            </defs>
            <polygon 
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
              fill="none" 
              stroke="url(#loaderGrad)" 
              strokeWidth="4"
            />
          </svg>
        </div>
        
        <p style={{
          color: '#94a3b8',
          fontSize: '16px',
          fontWeight: 500
        }}>
          Loading...
        </p>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    </div>
  );
}