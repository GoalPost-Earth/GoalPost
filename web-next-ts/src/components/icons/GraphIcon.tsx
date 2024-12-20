import * as React from 'react'

const GraphIcon: React.FC<React.SVGProps<SVGElement>> = ({
  color,
}: {
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke={color ?? '#E19E48'}
      strokeLinecap="round"
      strokeWidth="1.5"
      d="M21 21H10c-3.3 0-4.95 0-5.975-1.025S3 17.3 3 14V3"
    ></path>
    <path
      stroke={color ?? '#E19E48'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M20 17v-3M16 14V8M12 14v-3M8 11V5"
    ></path>
  </svg>
)

export default GraphIcon
