/** Íconos de línea simples (24×24, heredan el color del texto). */
import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 24, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconStar = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />
  </Base>
)
export const IconPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Base>
)
export const IconCalendar = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21" />
  </Base>
)
export const IconSprout = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21v-9" />
    <path d="M12 12C12 7.5 8.5 5 4 5c0 4.5 3.5 7 8 7z" />
    <path d="M12 14c0-4 3-6.5 8-6.5 0 4-3 6.5-8 6.5z" />
  </Base>
)
export const IconPlanet = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="6" />
    <path d="M4.5 16.5C2 18.5 1.5 20 2.3 20.8c1.4 1.4 7.2-1.6 12.4-6.8s8.2-11 6.8-12.4C20.7.8 19.2 1.3 17.3 3.6" />
  </Base>
)
export const IconDrop = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z" />
  </Base>
)
export const IconSnow = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1L19.1 4.9" />
  </Base>
)
export const IconSun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Base>
)
export const IconThermo = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z" />
  </Base>
)
export const IconGps = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Base>
)
export const IconArrow = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
)
export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v4M12 17.5v.5" />
  </Base>
)
export const IconInfo = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </Base>
)
export const IconSatellite = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 7l4 4-6 6-4-4z" />
    <path d="M7 13l-4 4M17 7l4-4M9 3l3 3M18 12l3 3" />
    <path d="M4 20c1.5 0 3-1 3-3" />
  </Base>
)
