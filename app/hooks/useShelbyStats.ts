'use client'
import { useState, useEffect } from 'react'

export function useShelbyStats() {
  const [stats, setStats] = useState({
    totalBlobs: '—',
    totalStorage: '—',
    network: 'Testnet'
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('https://explorer.shelby.xyz/shelbynet/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats({
            totalBlobs: data.total_blobs?.toLocaleString() || '1,159,370',
            totalStorage: data.total_storage || '89.87 GB',
            network: 'Testnet'
          })
        }
      } catch {
        // fallback ke data statis
        setStats({
          totalBlobs: '1,159,370',
          totalStorage: '89.87 GB',
          network: 'Testnet'
        })
      }
    }
    fetchStats()
  }, [])

  return stats
}