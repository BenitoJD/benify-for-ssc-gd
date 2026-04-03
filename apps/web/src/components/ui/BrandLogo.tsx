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
    full: 'h-10 w-10',
    mark: 'h-10 w-10',
  },
  md: {
    full: 'h-14 w-14',
    mark: 'h-12 w-12',
  },
  lg: {
    full: 'h-20 w-20',
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
    <span className={clsx('relative block overflow-hidden rounded-2xl', sizeClasses[size][variant], className)}>
      <Image
        src="/olli-logo.png"
        alt="OLLI for SSC GD logo"
        width={640}
        height={640}
        priority={priority}
        sizes={variant === 'full' ? '(max-width: 768px) 56px, 80px' : '64px'}
        className={clsx('h-full w-full object-cover', imageClassName)}
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
