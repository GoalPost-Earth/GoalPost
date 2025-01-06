import { Icon, IconProps } from '@chakra-ui/react'
import React from 'react'

const CommunityIcon = ({ color = 'brandIcons', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="35"
      fill="none"
      viewBox="0 0 35 35"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M17.896 25.417h-4.679c-1.223 0-2.196-.596-3.07-1.428-1.788-1.704 1.148-3.066 2.268-3.733a8.43 8.43 0 0 1 7.46-.554"
      ></path>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M21.063 13.146a3.563 3.563 0 1 1-7.126 0 3.563 3.563 0 0 1 7.126 0Z"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M22.646 25.417v-5.542m-2.771 2.77h5.542"
      ></path>
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M18.291 13.542a3.167 3.167 0 1 1-6.333 0 3.167 3.167 0 0 1 6.333 0Z"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M19.875 16.708a3.167 3.167 0 1 0 0-6.333"
      ></path>
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M16.708 19.084h-3.167a3.96 3.96 0 0 0-3.958 3.958c0 .874.709 1.583 1.583 1.583h7.917c.875 0 1.583-.709 1.583-1.583a3.96 3.96 0 0 0-3.958-3.959Z"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M21.458 19.084a3.96 3.96 0 0 1 3.958 3.958c0 .874-.709 1.583-1.583 1.583h-1.187"
      ></path>
    </svg>
  </Icon>
)

export default CommunityIcon
