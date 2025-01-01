import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const HamburgerIcon = ({ color = 'brandIcons', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="14"
      fill="none"
      viewBox="0 0 22 14"
    >
      <path
        fill="#C05621"
        d="M2 0a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2zm0 6a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2zm0 6a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2z"
      ></path>
    </svg>
  </Icon>
)

export default HamburgerIcon
