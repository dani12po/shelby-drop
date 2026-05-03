'use client'
import { useState, useEffect } from 'react'
import { useNetwork } from './useNetwork'
import { getNetworkConfig } from '@/config/shelby'

export function useShelbyStats() {
  const { network } = useNetwork()
  const networkConfig = getNetworkConfig(network)
  
  const [stats, setStats] = useState({
    totalBlobs: '—',
    totalStorage: '—',
    network: 'Testnet'
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch stats from the current network's explorer API
        const res = await fetch(`${networkConfig.shelbyExplorerBase}/api/stats`)
        if (res.ok) {
          const data = await res.json()
          setStats({
            totalBlobs: data.total_blobs?.toLocaleString() || '0',
            totalStorage: data.total_storage || '0 GB',
            network: network === 'testnet' ? 'Testnet' : 'Shelbynet'
          })
        } else {
          throw new Error('Failed to fetch stats')
        }
      } catch (err) {
        console.error('Error fetching Shelby stats:', err)
        // Fallback to zero/empty instead of dummy data for production-ready feel
        setStats({
          totalBlobs: '0',
          totalStorage: '0 GB',
          network: network === 'testnet' ? 'Testnet' : 'Shelbynet'
        })
      }
    }
    fetchStats()
  }, [network, networkConfig.shelbyExplorerBase])

  return stats
}
