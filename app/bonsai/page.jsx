"use client"

import dynamic from 'next/dynamic'
import { BonsaiPageSkeleton } from '@/components/BonsaiSkeleton'

// Lazy load the heavy Bonsai components
const BonsaiInterface = dynamic(() => import('./components/BonsaiInterface'), {
  loading: () => <BonsaiPageSkeleton />,
  ssr: false // Bonsai interface is interactive, doesn't need SSR
})

export default function BonsaiPage() {
  return <BonsaiInterface />
}
