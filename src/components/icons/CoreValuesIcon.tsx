import { Icon, IconProps } from '@chakra-ui/react'
import * as React from 'react'

const CoreValuesIcon = ({ color = 'brandIcons', ...rest }: IconProps) => (
  <Icon
    color={color}
    width="24px"
    height="22px"
    {...rest}
    colorPalette={'brandIcons'}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill="currentColor"
        d="m10 4.06-.896-.921C7 .976 3.142 1.723 1.75 4.44c-.654 1.28-.801 3.125.392 5.482 1.15 2.268 3.543 4.986 7.858 7.946 4.315-2.96 6.706-5.678 7.857-7.946 1.194-2.358 1.048-4.203.393-5.482C16.857 1.723 13 .975 10.896 3.138zm0 15.315C-9.166 6.71 4.099-3.175 9.78 2.054q.113.103.22.214.105-.111.22-.213C15.9-3.177 29.166 6.71 10 19.375"
      ></path>
    </svg>
  </Icon>
)

export default CoreValuesIcon
