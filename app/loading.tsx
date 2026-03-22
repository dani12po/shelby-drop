'use client'

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Spinner */}
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.2)',
          borderTopColor: '#8b5cf6',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{
          fontSize: '0.875rem',
          color: '#475569'
        }}>
          Loading...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}