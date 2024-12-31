import { Icon, IconProps } from '@chakra-ui/react'
import * as React from 'react'

const CarePointsIcon = ({ color = 'brandIcons', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill="currentColor"
        d="M16.6 17.5H19v2h-6v-6h2v2.73c1.83-1.47 3-3.71 3-6.23 0-4.07-3.06-7.44-7-7.93V.05c5.05.5 9 4.76 9 9.95 0 2.99-1.32 5.67-3.4 7.5M2 10c0-2.52 1.17-4.77 3-6.23V6.5h2v-6H1v2h2.4A9.97 9.97 0 0 0 0 10c0 5.19 3.95 9.45 9 9.95v-2.02c-3.94-.49-7-3.86-7-7.93m12.24-3.89-5.66 5.66-2.83-2.83-1.41 1.41 4.24 4.24 7.07-7.07z"
      ></path>
    </svg>
  </Icon>
)

export default CarePointsIcon
