import * as React from 'react'

const LocationIcon: React.FC<React.SVGProps<SVGElement>> = () => (
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
      d="M11.479 7.125a1.98 1.98 0 1 1-3.959 0 1.98 1.98 0 0 1 3.959 0Z"
    ></path>
    <path
      stroke="#fff"
      strokeWidth="1.5"
      d="M10.495 13.849a1.435 1.435 0 0 1-1.99 0C6.058 11.479 2.782 8.833 4.38 4.99 5.245 2.912 7.319 1.583 9.5 1.583s4.255 1.33 5.12 3.407c1.595 3.838-1.674 6.498-4.125 8.859Z"
    ></path>
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeWidth="1.5"
      d="M14.25 15.833c0 .874-2.127 1.583-4.75 1.583s-4.75-.709-4.75-1.583"
    ></path>
  </svg>
)

export default LocationIcon
