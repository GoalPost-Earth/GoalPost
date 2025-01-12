import * as React from 'react'

import { Icon, IconProps } from '@chakra-ui/react'

const DeleteIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon color={color} width="12px" height="15px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="16"
      fill="none"
      viewBox="0 0 12 16"
    >
      <path
        fill="currentColor"
        d="M1 13.833c0 .917.75 1.667 1.667 1.667h6.666c.917 0 1.667-.75 1.667-1.667v-10H1zM2.667 5.5h6.666v8.333H2.667zm6.25-4.167L8.083.5H3.917l-.834.833H.167V3h11.666V1.333z"
      ></path>
    </svg>
  </Icon>
)

export default DeleteIcon
