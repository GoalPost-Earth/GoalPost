import { Icon, IconProps } from '@chakra-ui/react'
import * as React from 'react'

const CalenderIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon color={color} {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      fill="none"
      viewBox="0 0 10 10"
    >
      <path
        fill="#6F7175"
        d="M7.778 3.929H2.222v1.11h5.556zM8.888.754h-.555V0h-1.11v.754H2.777V0H1.667v.754H1.11c-.617 0-1.105.5-1.105 1.111L0 8.93C0 9.539.494 10 1.111 10H8.89C9.5 10 10 9.54 10 8.929V1.865C10 1.254 9.5.754 8.889.754m0 8.175H1.112V2.817H8.89zM6.112 6.15H2.222v1.11h3.89z"
      ></path>
    </svg>
  </Icon>
)

export default CalenderIcon
