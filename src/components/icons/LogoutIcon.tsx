import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const LogoutIcon = ({ color = 'brandIcons', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M9 6.375c.074-1.852 1.617-3.424 3.684-3.374.481.012 1.076.18 2.265.515 2.861.807 5.345 2.164 5.941 5.203.11.558.11 1.187.11 2.444v1.674c0 1.257 0 1.886-.11 2.444-.596 3.04-3.08 4.396-5.941 5.203-1.19.335-1.784.503-2.265.515-2.067.05-3.61-1.522-3.684-3.374"
      ></path>
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3 12h11M3 12c0 .7 1.994 2.008 2.5 2.5M3 12c0-.7 1.994-2.008 2.5-2.5"
      ></path>
    </svg>
  </Icon>
)

export default LogoutIcon
