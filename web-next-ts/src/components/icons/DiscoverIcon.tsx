import * as React from 'react'

const DiscoverIcon: React.FC<React.SVGProps<SVGElement>> = ({
  color,
}: {
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      fill={color ?? '#E19E48'}
      fillRule="evenodd"
      d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0m0 1.448a8.552 8.552 0 1 1 0 17.104 8.552 8.552 0 0 1 0-17.104m3.008 4.637L8.096 7.622a.72.72 0 0 0-.474.474l-1.537 4.912a.724.724 0 0 0 .907.907l4.912-1.537a.72.72 0 0 0 .474-.474l1.537-4.912a.724.724 0 0 0-.907-.907m-.888 1.794-1.011 3.23-3.23 1.011L8.89 8.89z"
      clipRule="evenodd"
    ></path>
  </svg>
)

export default DiscoverIcon
