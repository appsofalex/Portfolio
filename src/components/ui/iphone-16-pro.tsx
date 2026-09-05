import { useId, type SVGProps } from "react"

export interface Iphone16ProProps extends SVGProps<SVGSVGElement> {
  width?: number
  height?: number
}

/** Crisp vector iPhone 16 Pro frame. Screen content is layered behind via `.device-screen`. */
export function Iphone16Pro({
  width,
  height,
  className,
  ...props
}: Iphone16ProProps) {
  const reactId = useId().replace(/:/g, "")
  const bezelMaskId = `${reactId}-bezel`
  const metalGradId = `${reactId}-metal`

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
        <linearGradient
          id={metalGradId}
          x1="8"
          y1="0"
          x2="192"
          y2="400"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F4F0EA" />
          <stop offset="22%" stopColor="#D9D3CA" />
          <stop offset="48%" stopColor="#C2BBB1" />
          <stop offset="72%" stopColor="#DED8CF" />
          <stop offset="100%" stopColor="#B4ADA3" />
        </linearGradient>
        <mask id={bezelMaskId}>
          <rect width="200" height="400" fill="white" />
          <rect
            x="11.5"
            y="10.5"
            width="177"
            height="379"
            rx="27"
            ry="27"
            fill="black"
          />
        </mask>
      </defs>

      <g mask={`url(#${bezelMaskId})`}>
        {/* Outer chassis + buttons — Natural Titanium */}
        <path
          fill={`url(#${metalGradId})`}
          d="M196.11,128.09c0-.25-.2-.45-.45-.45-.11.04-.37.03-.69,0V36.69c0-17.84-14.46-32.31-32.31-32.31H37.48C19.63,4.39,5.17,18.85,5.17,36.69v48.99c-.3.02-.55.03-.66-.02-.25,0-.45.2-.45.45,0,0,0,17.29,0,17.29-.03.41.5.49,1.11.48v13.63c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v7.95c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v178.86c0,17.84,14.46,32.31,32.31,32.31h125.2c17.84,0,32.31-14.46,32.31-32.31v-188.87c.32-.02.58-.03.69.04,1.26.1.03-45.94.45-46.38ZM186.07,362.63c0,13.56-10.99,24.56-24.56,24.56H38.64c-13.56,0-24.56-10.99-24.56-24.56V37.37c0-13.56,10.99-24.56,24.56-24.56h122.87c13.56,0,24.56,10.99,24.56,24.56v325.26Z"
        />
        {/* Black face — slightly expanded to leave a thinner titanium rim */}
        <rect
          x="7.95"
          y="6.5"
          width="184.1"
          height="387"
          rx="29.6"
          ry="29.6"
          fill="#000000"
        />
      </g>

      {/* Dynamic Island */}
      <path
        fill="#000000"
        d="M119.61,33.86h-38.93c-10.48-.18-10.5-15.78,0-15.96,0,0,38.93,0,38.93,0,4.41,0,7.98,3.57,7.98,7.98,0,4.41-3.57,7.98-7.98,7.98Z"
      />
    </svg>
  )
}
