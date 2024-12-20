import * as React from 'react'

const MenuOutline = ({ color }: { color?: string }) => (
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
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M16.285 2h3.267A2.46 2.46 0 0 1 22 4.47v3.294c0 1.363-1.096 2.47-2.448 2.47h-3.267a2.46 2.46 0 0 1-2.449-2.47V4.47A2.46 2.46 0 0 1 16.286 2M4.449 2h3.265a2.46 2.46 0 0 1 2.45 2.47v3.294a2.46 2.46 0 0 1-2.45 2.47H4.45A2.46 2.46 0 0 1 2 7.764V4.47A2.46 2.46 0 0 1 4.449 2M4.449 13.766h3.265a2.46 2.46 0 0 1 2.45 2.47v3.294A2.46 2.46 0 0 1 7.713 22H4.45A2.46 2.46 0 0 1 2 19.53v-3.293a2.46 2.46 0 0 1 2.449-2.471M16.285 13.766h3.267c1.352 0 2.448 1.105 2.448 2.47v3.294A2.46 2.46 0 0 1 19.552 22h-3.267a2.46 2.46 0 0 1-2.449-2.47v-3.293a2.46 2.46 0 0 1 2.45-2.471"
      clipRule="evenodd"
    />
  </svg>
)

export default MenuOutline
