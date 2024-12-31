import * as React from 'react'

const GoalsIcon: React.FC<React.SVGProps<SVGElement>> = ({
  color,
}: {
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    fill="none"
    viewBox="0 0 22 22"
  >
    <path
      fill={color ?? '#C05621'}
      fillRule="evenodd"
      d="M11 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18M0 11C0 4.925 4.925 0 11 0s11 4.925 11 11-4.925 11-11 11S0 17.075 0 11"
      clipRule="evenodd"
    ></path>
    <path
      fill={color ?? '#C05621'}
      fillRule="evenodd"
      d="M11 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10m-7 5a7 7 0 1 1 14 0 7 7 0 0 1-14 0"
      clipRule="evenodd"
    ></path>
    <path
      fill={color ?? '#C05621'}
      fillRule="evenodd"
      d="M11 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0"
      clipRule="evenodd"
    ></path>
  </svg>
)

export default GoalsIcon
