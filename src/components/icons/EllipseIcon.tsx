import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const EllipseIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="20"
      fill="none"
      viewBox="0 0 19 20"
    >
      <circle cx="9.5" cy="10" r="9.5" fill="#B7E0A3"></circle>
    </svg>
  </Icon>
)

export default EllipseIcon
