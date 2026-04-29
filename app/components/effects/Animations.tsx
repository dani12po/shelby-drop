'use client'

import { ReactNode } from 'react'
import { motion, Variants, HTMLMotionProps } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

// Custom easing - smoother curve
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

// Subtle fade-in animation - not too bright
const subtleFadeVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    }
  },
}

// Even more subtle for nested elements
const softFadeVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 10,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
}

// Staggered children - subtle
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
}

// Float animation
const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
}

// Pulse glow - subtle
const pulseGlowVariants: Variants = {
  initial: { 
    boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)',
  },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(139, 92, 246, 0)',
      '0 0 20px 2px rgba(139, 92, 246, 0.1)',
      '0 0 0 0 rgba(139, 92, 246, 0)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
}

// Shimmer effect for loading - subtle
const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
}

// Slide in from direction - subtle
const slideInVariants = (direction: 'left' | 'right' | 'up' | 'down'): Variants => ({
  hidden: {
    opacity: 0,
    x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
    y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  }
})

// Page transition wrapper
const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      when: 'beforeChildren',
      staggerChildren: 0.05,
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3,
    }
  }
}

// =====================
// COMPONENT: FadeIn
// =====================
interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'main'
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = '',
  as: Component = 'div'
}: FadeInProps) {
  return (
    <Component className={className}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={subtleFadeVariants}
        transition={{ duration, delay }}
      >
        {children}
      </motion.div>
    </Component>
  )
}

// =====================
// COMPONENT: SoftFadeIn - More subtle
// =====================
interface SoftFadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function SoftFadeIn({ children, delay = 0, className = '' }: SoftFadeInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={softFadeVariants}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: StaggeredFadeIn
// =====================
interface StaggeredFadeInProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'ul' | 'ol'
}

export function StaggeredFadeIn({ 
  children, 
  className = '',
  as: Component = 'div' 
}: StaggeredFadeInProps) {
  return (
    <Component className={className}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {children}
      </motion.div>
    </Component>
  )
}

// =====================
// COMPONENT: HoverScale
// =====================
interface HoverScaleProps {
  children: ReactNode
  scale?: number
  className?: string
}

export function HoverScale({ 
  children, 
  scale = 1.03,
  className = '' 
}: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: HoverGlow
// =====================
interface HoverGlowProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function HoverGlow({ 
  children, 
  className = '',
  glowColor = 'rgba(139, 92, 246, 0.15)'
}: HoverGlowProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        boxShadow: `0 0 25px 5px ${glowColor}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: AnimatedButton
// =====================
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
}

export function AnimatedButton({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}: AnimatedButtonProps) {
  const { isDark } = useTheme()
  
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
  }
  
  const variantStyles = {
    primary: {
      background: isDark 
        ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
        : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      color: '#fff',
      boxShadow: isDark 
        ? '0 4px 15px rgba(139, 92, 246, 0.3)'
        : '0 4px 15px rgba(124, 58, 237, 0.25)',
    },
    secondary: {
      background: isDark 
        ? 'rgba(99, 102, 241, 0.15)'
        : 'rgba(124, 58, 237, 0.1)',
      color: isDark ? '#c4b5fd' : '#7c3aed',
    },
    outline: {
      background: 'transparent',
      border: `2px solid ${isDark ? '#6366f1' : '#7c3aed'}`,
      color: isDark ? '#c4b5fd' : '#7c3aed',
    }
  }

  return (
    <motion.button
      className={className}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: variant === 'outline' 
          ? `0 0 20px ${isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(124, 58, 237, 0.25)'}`
          : `0 6px 25px ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.35)'}`,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// =====================
// COMPONENT: Float
// =====================
interface FloatProps {
  children: ReactNode
  duration?: number
  className?: string
}

export function Float({ 
  children, 
  duration = 4,
  className = '' 
}: FloatProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          y: [0, -8, 0],
          transition: {
            duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: PulseGlow
// =====================
interface PulseGlowProps {
  children: ReactNode
  className?: string
}

export function PulseGlow({ children, className = '' }: PulseGlowProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={pulseGlowVariants}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: SlideIn
// =====================
interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0,
  className = '' 
}: SlideInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={slideInVariants(direction)}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: Shimmer
// =====================
interface ShimmerProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Shimmer({ 
  className = '', 
  width = '100%', 
  height = '20px' 
}: ShimmerProps) {
  const { isDark } = useTheme()
  
  return (
    <div 
      className={className}
      style={{
        width,
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        background: isDark 
          ? 'rgba(139, 92, 246, 0.1)'
          : 'rgba(139, 92, 246, 0.08)',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.15), transparent)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// =====================
// COMPONENT: PageTransition
// =====================
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: BounceIn
// =====================
interface BounceInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function BounceIn({ 
  children, 
  delay = 0,
  className = '' 
}: BounceInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
      }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: RotateIn
// =====================
interface RotateInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function RotateIn({ 
  children, 
  delay = 0,
  className = '' 
}: RotateInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        rotate: 0, 
        scale: 1,
      }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// =====================
// COMPONENT: TextReveal
// =====================
interface TextRevealProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

export function TextReveal({ 
  text, 
  className = '',
  as: Component = 'p'
}: TextRevealProps) {
  const words = text.split(' ')
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  }
  
  const wordVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      filter: 'blur(2px)',
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      }
    }
  }

  return (
    <Component className={className}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ display: 'inline' }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  )
}
