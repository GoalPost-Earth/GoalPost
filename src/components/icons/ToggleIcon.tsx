import React from 'react'

const ToggleIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="19"
    fill="none"
    viewBox="0 0 19 19"
  >
    <path
      stroke="#fff"
      strokeWidth="1.5"
      d="M15.042 9.5a2.375 2.375 0 1 1-4.75 0 2.375 2.375 0 0 1 4.75 0Z"
    ></path>
    <path
      stroke="#fff"
      strokeWidth="1.5"
      d="M12.666 4.75H6.333a4.75 4.75 0 1 0 0 9.5h6.333a4.75 4.75 0 0 0 0-9.5Z"
    ></path>
  </svg>
)

export default ToggleIcon
