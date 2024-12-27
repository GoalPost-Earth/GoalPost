import * as React from 'react'

const MemberGuideIcon: React.FC<React.SVGProps<SVGElement>> = ({
  color,
}: {
  color?: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="21"
    fill="none"
    viewBox="0 0 17 21"
  >
    <circle
      cx="8.579"
      cy="5.778"
      r="4.778"
      stroke={color ?? '#E19E48'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    ></circle>
    <path
      stroke={color ?? '#E19E48'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M1 17.202a2.2 2.2 0 0 1 .22-.97c.457-.916 1.748-1.401 2.819-1.62a17 17 0 0 1 2.343-.33 25 25 0 0 1 4.385 0q1.182.083 2.343.33c1.07.219 2.361.658 2.82 1.62a2.27 2.27 0 0 1 0 1.949c-.459.961-1.75 1.4-2.82 1.61a16 16 0 0 1-2.343.34q-1.783.15-3.57.055c-.275 0-.54 0-.815-.055a15.4 15.4 0 0 1-2.334-.34c-1.08-.21-2.361-.649-2.828-1.61a2.3 2.3 0 0 1-.22-.98"
      clipRule="evenodd"
    ></path>
  </svg>
)

export default MemberGuideIcon
