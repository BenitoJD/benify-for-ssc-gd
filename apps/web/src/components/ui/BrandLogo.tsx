import Image from 'next/image'
import Link from 'next/link'
import { clsx } from 'clsx'

interface BrandLogoProps {
  href?: string
  className?: string
  imageClassName?: string
  priority?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'mark'
}

const sizeClasses = {
  sm: {
    full: 'h-10 w-auto',
    mark: 'h-10 w-10',
  },
  md: {
    full: 'h-14 w-auto',
    mark: 'h-12 w-12',
  },
  lg: {
    full: 'h-20 w-auto',
    mark: 'h-16 w-16',
  },
}

function LogoImage({
  className,
  imageClassName,
  priority = false,
  size = 'md',
  variant = 'full',
}: Omit<BrandLogoProps, 'href'>) {
  return (
    <span className={clsx('relative block', sizeClasses[size][variant], className)}>
      <Image
        src="/olli-academy-ssc-gd-logo.png"
        alt="OLLI Academy SSC GD logo"
        fill
        priority={priority}
        sizes={variant === 'full' ? '(max-width: 768px) 160px, 220px' : '64px'}
        className={clsx('object-contain', imageClassName)}
      />
    </span>
  )
}

export function BrandLogo(props: BrandLogoProps) {
  if (!props.href) {
    return <LogoImage {...props} />
  }

  return (
    <Link href={props.href} className={clsx('inline-flex items-center', props.className)}>
      <LogoImage {...props} className={undefined} />
    </Link>
  )
}
