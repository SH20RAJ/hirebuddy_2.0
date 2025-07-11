import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface FloatingParticlesProps {
  /**
   * Number of particles to render
   */
  count?: number
  /**
   * Speed of particle movement (0-1)
   */
  speed?: number
  /**
   * Size range of particles [min, max]
   */
  size?: [number, number]
  /**
   * Color of particles
   */
  color?: string
  /**
   * Opacity of particles (0-1)
   */
  opacity?: number
  /**
   * Enable drift direction bias
   */
  drift?: { x: number; y: number }
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

export function FloatingParticles({
  count = 25,
  speed = 0.3,
  size = [1, 3],
  color = "hsl(var(--pink-300))",
  opacity = 0.4,
  drift = { x: 0, y: -0.1 },
  className,
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>()
  const isVisibleRef = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let resizeTimeout: NodeJS.Timeout

    function initParticles() {
      const rect = container!.getBoundingClientRect()
      particlesRef.current = []

      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(rect.width, rect.height))
      }
    }

    function createParticle(width: number, height: number): Particle {
      const maxLife = 300 + Math.random() * 200
      return {
        x: Math.random() * width,
        y: height + Math.random() * 100,
        vx: (Math.random() - 0.5) * speed * 0.5 + drift.x,
        vy: -Math.random() * speed - Math.abs(drift.y),
        size: size[0] + Math.random() * (size[1] - size[0]),
        opacity: 0.2 + Math.random() * 0.6,
        life: 0,
        maxLife,
      }
    }

    function updateParticles() {
      const rect = container!.getBoundingClientRect()
      const particles = particlesRef.current

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life += 1

        // Add subtle floating motion
        particle.x += Math.sin(particle.life * 0.01) * 0.2
        particle.vy += Math.sin(particle.life * 0.008) * 0.01

        // Reset particle if it goes off screen or dies
        if (
          particle.y < -particle.size * 2 ||
          particle.x < -particle.size * 2 ||
          particle.x > rect.width + particle.size * 2 ||
          particle.life > particle.maxLife
        ) {
          particles[index] = createParticle(rect.width, rect.height)
        }
      })
    }

    function drawParticles() {
      if (!ctx || !container) return

      const rect = container.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const particles = particlesRef.current
      particles.forEach((particle) => {
        // Calculate alpha based on life cycle
        const lifeRatio = particle.life / particle.maxLife
        let alpha = particle.opacity * opacity

        // Fade in
        if (lifeRatio < 0.1) {
          alpha *= lifeRatio / 0.1
        }
        // Fade out
        else if (lifeRatio > 0.8) {
          alpha *= (1 - lifeRatio) / 0.2
        }

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Add subtle glow effect
        ctx.shadowColor = color
        ctx.shadowBlur = particle.size * 2
        ctx.fill()
        ctx.restore()
      })
    }

    function setSize() {
      if (!container || !canvas) return
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      
      ctx.scale(dpr, dpr)
    }

    function animate() {
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      updateParticles()
      drawParticles()
      rafRef.current = requestAnimationFrame(animate)
    }

    function onResize() {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setSize()
        initParticles()
      }, 100)
    }

    // Intersection Observer for performance
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting
      },
      { threshold: 0.1 }
    )

    if (container) {
      observer.observe(container)
    }

    setSize()
    initParticles()
    rafRef.current = requestAnimationFrame(animate)

    window.addEventListener("resize", onResize, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      clearTimeout(resizeTimeout)
      observer.disconnect()
      window.removeEventListener("resize", onResize)
    }
  }, [count, speed, size, color, opacity, drift])

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}