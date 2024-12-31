import * as React from 'react'

const HamburgerIcon: React.FC<React.SVGProps<SVGElement>> = ({
  color,
}: {
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="14"
    fill="none"
    viewBox="0 0 22 14"
  >
    <path
      fill={color ?? '#C05621'}
      d="M2 0a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2zm0 6a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2zm0 6a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2z"
    ></path>
  </svg>
)

export default HamburgerIcon
