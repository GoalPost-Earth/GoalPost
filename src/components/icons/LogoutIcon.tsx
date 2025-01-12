import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const LogoutIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        fill="currentColor"
        d="M13.835.5H2.168C1.25.5.502 1.248.502 2.167V5.5h1.666V2.167h11.667v11.666H2.168V10.5H.502v3.333c0 .92.747 1.667 1.666 1.667h11.667c.92 0 1.667-.748 1.667-1.667V2.167c0-.92-.749-1.667-1.667-1.667"
      ></path>
      <path
        fill="currentColor"
        d="M7.167 11.334 11.333 8 7.167 4.667v2.5H.5v1.667h6.667z"
      ></path>
    </svg>
  </Icon>
)

export default LogoutIcon
