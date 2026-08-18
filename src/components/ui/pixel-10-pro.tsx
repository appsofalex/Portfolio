import { useId, type SVGProps } from "react"

export interface Pixel10ProProps extends SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  src?: string
}

export function Pixel10Pro({
  width,
  height,
  src,
  className,
  ...props
}: Pixel10ProProps) {
  const reactId = useId().replace(/:/g, "")
  const bezelMaskId = `${reactId}-bezel`
  const screenClipId = `${reactId}-screen`

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 400"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <defs>
        <mask id={bezelMaskId}>
          <rect width="200" height="400" fill="black" />
          <rect x="5" y="4" width="190" height="392" rx="20" fill="white" />
          <rect x="11" y="11" width="178" height="378" rx="14" fill="black" />
        </mask>
        <clipPath id={screenClipId}>
          <rect x="11" y="11" width="178" height="378" rx="14" ry="14" />
        </clipPath>
      </defs>

      <rect
        width="200"
        height="400"
        fill="#1c1e20"
        mask={`url(#${bezelMaskId})`}
      />

      {src && (
        <image
          href={src}
          x="11"
          y="11"
          width="178"
          height="378"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${screenClipId})`}
        />
      )}

      <circle cx="100" cy="24" r="5.6" fill="#0a0a0a" />
      <circle cx="100" cy="24" r="3.5" fill="#152044" />
      <circle cx="98.8" cy="22.8" r="1.15" fill="#5b7ab8" opacity="0.55" />
    </svg>
  )
}
