import { brandConfig } from '../theme/brand.config'

interface BrandLogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function BrandLogo({ className = '', showText = true, size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {brandConfig.logo.primary ? (
        <img
          src={brandConfig.logo.primary}
          alt={brandConfig.logo.alt}
          className={sizeClasses[size]}
        />
      ) : (
        // Fallback: Text logo if image not available
        <div className={`${sizeClasses[size]} bg-primary-500 rounded flex items-center justify-center text-white font-bold`}>
          A
        </div>
      )}
      {showText && (
        <span className={`font-semibold text-gray-900 ${textSizeClasses[size]}`}>
          {brandConfig.name}
        </span>
      )}
    </div>
  )
}

