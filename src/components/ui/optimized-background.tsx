import React, { useMemo } from "react"
import { Waves } from "./waves"
import { FloatingParticles } from "./floating-particles"
import { useDeviceType, useReducedMotion, useBatteryStatus } from "@/hooks/useDeviceType"
import { cn } from "@/lib/utils"

interface OptimizedBackgroundProps {
  /**
   * Performance level: 'auto' | 'low' | 'medium' | 'high'
   * 'auto' will determine based on device capabilities
   */
  performance?: 'auto' | 'low' | 'medium' | 'high'
  /**
   * Override automatic detection
   */
  forceSettings?: {
    enableWaves?: boolean
    enableSecondaryWaves?: boolean
    enableParticles?: boolean
    enableInteraction?: boolean
  }
  /**
   * Color theme
   */
  theme?: 'pink' | 'coral' | 'neutral'
  /**
   * Background opacity
   */
  opacity?: number
  className?: string
}

export function OptimizedBackground({
  performance = 'auto',
  forceSettings,
  theme = 'pink',
  opacity = 1,
  className
}: OptimizedBackgroundProps) {
  const { isMobile, isTablet, isDesktop, screenSize } = useDeviceType()
  const prefersReducedMotion = useReducedMotion()
  const { lowBattery, charging } = useBatteryStatus()

  // Performance level calculation
  const performanceLevel = useMemo(() => {
    if (performance !== 'auto') return performance

    // Force low performance on reduced motion preference
    if (prefersReducedMotion) return 'low'

    // Force low performance on low battery
    if (lowBattery && !charging) return 'low'

    // Device-based performance
    if (isMobile) {
      return screenSize === 'sm' ? 'low' : 'medium'
    } else if (isTablet) {
      return 'medium'
    } else {
      return 'high'
    }
  }, [performance, prefersReducedMotion, lowBattery, charging, isMobile, isTablet, screenSize])

  // Color configurations
  const colorThemes = {
    pink: {
      primary: "hsl(var(--pink-400) / 0.25)",
      secondary: "hsl(var(--coral-300) / 0.15)",
      particles: "hsl(var(--pink-400) / 0.6)",
      gradients: [
        "bg-gradient-to-br from-pink-100 to-pink-200",
        "bg-gradient-to-br from-orange-100 to-coral-200",
        "bg-gradient-to-br from-pink-50 to-orange-50"
      ]
    },
    coral: {
      primary: "hsl(var(--coral-400) / 0.25)",
      secondary: "hsl(var(--pink-300) / 0.15)",
      particles: "hsl(var(--coral-400) / 0.6)",
      gradients: [
        "bg-gradient-to-br from-coral-100 to-coral-200",
        "bg-gradient-to-br from-pink-100 to-orange-200",
        "bg-gradient-to-br from-coral-50 to-pink-50"
      ]
    },
    neutral: {
      primary: "hsl(var(--warm-gray-400) / 0.2)",
      secondary: "hsl(var(--warm-gray-300) / 0.12)",
      particles: "hsl(var(--warm-gray-400) / 0.5)",
      gradients: [
        "bg-gradient-to-br from-warm-gray-100 to-warm-gray-200",
        "bg-gradient-to-br from-gray-100 to-gray-200",
        "bg-gradient-to-br from-warm-gray-50 to-gray-50"
      ]
    }
  }

  const colors = colorThemes[theme]

  // Performance-based settings
  const settings = useMemo(() => {
    const base = {
      enableWaves: true,
      enableSecondaryWaves: false,
      enableParticles: false,
      enableInteraction: false,
      waveConfig: {
        speedX: 0.004,
        speedY: 0.003,
        ampX: 12,
        ampY: 8,
        xGap: 20,
        yGap: 35,
        friction: 0.93,
        tension: 0.002,
        maxCursorMove: 30,
        opacity: 0.3
      },
      particleConfig: {
        count: 5,
        speed: 0.2,
        size: [0.5, 1] as [number, number],
        opacity: 0.15
      }
    }

    switch (performanceLevel) {
      case 'high':
        return {
          ...base,
          enableSecondaryWaves: true,
          enableParticles: true,
          enableInteraction: true,
          waveConfig: {
            speedX: 0.006,
            speedY: 0.004,
            ampX: 18,
            ampY: 10,
            xGap: 15,
            yGap: 30,
            friction: 0.95,
            tension: 0.003,
            maxCursorMove: 60,
            opacity: 0.5
          },
          particleConfig: {
            count: 20,
            speed: 0.4,
            size: [1, 2.5] as [number, number],
            opacity: 0.3
          }
        }

      case 'medium':
        return {
          ...base,
          enableParticles: true,
          enableInteraction: !isMobile,
          waveConfig: {
            speedX: 0.005,
            speedY: 0.0035,
            ampX: 15,
            ampY: 9,
            xGap: 18,
            yGap: 32,
            friction: 0.94,
            tension: 0.0025,
            maxCursorMove: 45,
            opacity: 0.4
          },
          particleConfig: {
            count: 12,
            speed: 0.3,
            size: [0.8, 2] as [number, number],
            opacity: 0.25
          }
        }

      case 'low':
      default:
        return base
    }
  }, [performanceLevel, isMobile])

  // Apply force overrides
  const finalSettings = {
    ...settings,
    ...forceSettings
  }

  return (
    <div 
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      {/* Primary Waves */}
      {finalSettings.enableWaves && (
        <Waves
          lineColor={colors.primary}
          backgroundColor="transparent"
          waveSpeedX={finalSettings.waveConfig.speedX}
          waveSpeedY={finalSettings.waveConfig.speedY}
          waveAmpX={finalSettings.waveConfig.ampX}
          waveAmpY={finalSettings.waveConfig.ampY}
          xGap={finalSettings.waveConfig.xGap}
          yGap={finalSettings.waveConfig.yGap}
          friction={finalSettings.waveConfig.friction}
          tension={finalSettings.waveConfig.tension}
          maxCursorMove={finalSettings.waveConfig.maxCursorMove}
          opacity={finalSettings.waveConfig.opacity}
          interactive={finalSettings.enableInteraction}
          className="z-0"
        />
      )}

      {/* Secondary Waves */}
      {finalSettings.enableSecondaryWaves && (
        <Waves
          lineColor={colors.secondary}
          backgroundColor="transparent"
          waveSpeedX={finalSettings.waveConfig.speedX * 0.7}
          waveSpeedY={finalSettings.waveConfig.speedY * 1.5}
          waveAmpX={finalSettings.waveConfig.ampX * 1.4}
          waveAmpY={finalSettings.waveConfig.ampY * 1.5}
          xGap={finalSettings.waveConfig.xGap + 5}
          yGap={finalSettings.waveConfig.yGap + 10}
          friction={finalSettings.waveConfig.friction - 0.03}
          tension={finalSettings.waveConfig.tension * 0.7}
          maxCursorMove={finalSettings.waveConfig.maxCursorMove * 0.7}
          opacity={finalSettings.waveConfig.opacity * 0.6}
          interactive={false}
          className="z-0"
        />
      )}

      {/* Floating Particles */}
      {finalSettings.enableParticles && (
        <FloatingParticles
          count={finalSettings.particleConfig.count}
          speed={finalSettings.particleConfig.speed}
          size={finalSettings.particleConfig.size}
          color={colors.particles}
          opacity={finalSettings.particleConfig.opacity}
          drift={{ x: 0.05, y: -0.08 }}
          className="z-1"
        />
      )}

      {/* Static Background Elements */}
      <div className="absolute inset-0 z-1">
        <div className={`absolute top-20 left-20 w-64 h-64 ${colors.gradients[0]} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse`}></div>
        <div 
          className={`absolute bottom-20 right-20 w-80 h-80 ${colors.gradients[1]} rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse`}
          style={{ animationDelay: '2s' }}
        ></div>
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${colors.gradients[2]} rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse`}
          style={{ animationDelay: '4s' }}
        ></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 z-50 bg-black/80 text-white text-xs px-2 py-1 rounded">
          Performance: {performanceLevel}
        </div>
      )}
    </div>
  )
}

// Hook for manual performance control
export function useBackgroundPerformance() {
  const { isMobile, isDesktop } = useDeviceType()
  const prefersReducedMotion = useReducedMotion()
  const { lowBattery } = useBatteryStatus()

  const canUseHighPerformance = useMemo(() => {
    return isDesktop && !prefersReducedMotion && !lowBattery
  }, [isDesktop, prefersReducedMotion, lowBattery])

  const canUseParticles = useMemo(() => {
    return !prefersReducedMotion && !lowBattery
  }, [prefersReducedMotion, lowBattery])

  const shouldReduceAnimations = useMemo(() => {
    return prefersReducedMotion || lowBattery || (isMobile && window.innerWidth < 400)
  }, [prefersReducedMotion, lowBattery, isMobile])

  return {
    canUseHighPerformance,
    canUseParticles,
    shouldReduceAnimations,
    recommendedPerformance: canUseHighPerformance ? 'high' : 
                           canUseParticles ? 'medium' : 'low'
  }
}