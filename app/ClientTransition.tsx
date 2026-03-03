'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'

export default function ClientTransition({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleDragEnd = (
    event: any,
    info: { offset: { x: number } }
  ) => {
    if (info.offset.x < -100) {
      if (pathname === '/dashboard') router.push('/results')
    }

    if (info.offset.x > 100) {
      if (pathname === '/results') router.push('/dashboard')
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -50, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
