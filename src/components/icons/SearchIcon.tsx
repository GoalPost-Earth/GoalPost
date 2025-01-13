import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const SearchIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="16"
      fill="none"
      viewBox="0 0 17 16"
    >
      <path
        fill="currentColor"
        d="m16.11 13.728-3.095-3.095a6.833 6.833 0 1 0-1.884 1.885l3.095 3.094a1.35 1.35 0 0 0 1.884 0 1.33 1.33 0 0 0 0-1.884M7.34 2.011a4.83 4.83 0 1 1 0 9.66 4.83 4.83 0 0 1 0-9.66"
      ></path>
    </svg>
  </Icon>
)

export default SearchIcon
