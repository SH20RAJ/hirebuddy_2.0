import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocityX: number;
  velocityY: number;
  color: string;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

const colors = [
  'rgba(59, 130, 246, 0.1)', // blue
  'rgba(147, 51, 234, 0.1)', // purple
  'rgba(16, 185, 129, 0.1)', // green
  'rgba(245, 101, 101, 0.1)', // red
  'rgba(251, 191, 36, 0.1)', // yellow
];

export const FloatingParticles = ({ count = 20, className = "" }: FloatingParticlesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const createParticle = (id: number): Particle => {
      return {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.5 + 0.1,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    const updateParticles = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      particlesRef.current = particlesRef.current.map(particle => {
        let newX = particle.x + particle.velocityX;
        let newY = particle.y + particle.velocityY;

        // Bounce off walls
        if (newX <= 0 || newX >= rect.width) {
          particle.velocityX *= -1;
          newX = Math.max(0, Math.min(rect.width, newX));
        }
        if (newY <= 0 || newY >= rect.height) {
          particle.velocityY *= -1;
          newY = Math.max(0, Math.min(rect.height, newY));
        }

        return {
          ...particle,
          x: newX,
          y: newY
        };
      });

      animationRef.current = requestAnimationFrame(updateParticles);
    };

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, (_, i) => createParticle(i));
    
    // Start animation
    updateParticles();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particlesRef.current.map((particle, index) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
      
      {/* Additional decorative elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
          rotate: [360, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute top-2/3 left-1/2 w-20 h-20 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [-10, 10, -10],
          y: [-5, 5, -5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};