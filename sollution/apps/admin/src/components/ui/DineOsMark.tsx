import mark from './dineos-mark.png'

type DineOsMarkProps = {
  size: number
  color?: string
  className?: string
}

/** DineOS D from the launcher icon, tinted with `color`. */
export function DineOsMark({
  size,
  color = 'currentColor',
  className = '',
}: DineOsMarkProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`.trim()}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url(${mark})`,
        maskImage: `url(${mark})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}
