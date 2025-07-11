import { useState, useEffect } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  userAgent: string
  screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    userAgent: '',
    screenSize: 'lg'
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent
      const width = window.innerWidth
      const height = window.innerHeight

      // Device type detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
        (width <= 768 && 'ontouchstart' in window)
      
      const isTablet = /iPad/i.test(userAgent) || 
        (isMobile && Math.min(width, height) >= 768)
      
      const isDesktop = !isMobile && !isTablet
      
      const isTouch = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        ('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0)

      // Screen size detection based on Tailwind breakpoints
      let screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'sm'
      if (width >= 1536) screenSize = '2xl'
      else if (width >= 1280) screenSize = 'xl'
      else if (width >= 1024) screenSize = 'lg'
      else if (width >= 768) screenSize = 'md'

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        userAgent,
        screenSize
      })
    }

    // Initial detection
    updateDeviceInfo()

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo, { passive: true })
    window.addEventListener('orientationchange', updateDeviceInfo, { passive: true })

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// Additional utility hook for performance-based rendering
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook for battery-aware performance
export function useBatteryStatus() {
  const [batteryInfo, setBatteryInfo] = useState({
    charging: true,
    level: 1,
    lowBattery: false
  })

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: {
        charging: boolean;
        level: number;
        addEventListener: (event: string, handler: () => void) => void;
        removeEventListener: (event: string, handler: () => void) => void;
      }) => {
        const updateBatteryInfo = () => {
          setBatteryInfo({
            charging: battery.charging,
            level: battery.level,
            lowBattery: battery.level < 0.2 && !battery.charging
          })
        }

        updateBatteryInfo()
        battery.addEventListener('chargingchange', updateBatteryInfo)
        battery.addEventListener('levelchange', updateBatteryInfo)

        return () => {
          battery.removeEventListener('chargingchange', updateBatteryInfo)
          battery.removeEventListener('levelchange', updateBatteryInfo)
        }
      })
    }
  }, [])

  return batteryInfo
}