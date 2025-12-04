import { useEffect, useState } from 'react'
import { brandConfig } from '../theme/brand.config'

interface BrandLogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'auto' | 'black' | 'white' // Auto selects based on background/dark mode
}

export default function BrandLogo({ 
  className = '', 
  showText = true, 
  size = 'md',
  variant = 'auto'
}: BrandLogoProps) {
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    
    return () => observer.disconnect()
  }, [])

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-20 w-auto', // Auto width maintains aspect ratio for larger logos
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  // Determine which logo to use
  const getLogoSource = () => {
    if (variant === 'black') return brandConfig.logo.black
    if (variant === 'white') return brandConfig.logo.white
    
    // Auto mode: use white logo in dark mode, black logo in light mode
    return isDark ? brandConfig.logo.white : brandConfig.logo.black
  }

  const logoSource = getLogoSource()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoSource ? (
        <img
          src={logoSource}
          alt={brandConfig.logo.alt}
          className={sizeClasses[size]}
        />
      ) : (
        // Fallback: Text logo if image not available
        <div className={`${sizeClasses[size]} bg-black rounded flex items-center justify-center text-white font-bold`}>
          C
        </div>
      )}
      {showText && (
        <span className={`font-semibold text-black dark:text-white ${textSizeClasses[size]}`}>
          {brandConfig.name}
        </span>
      )}
    </div>
  )
}

