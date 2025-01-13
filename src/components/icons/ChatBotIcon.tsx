import { Icon, IconProps } from '@chakra-ui/react'
import * as React from 'react'

const ChatBotIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon
    color={color}
    width="24px"
    height="22px"
    {...rest}
    colorPalette={'brandIcons'}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="20"
      fill="none"
      viewBox="0 0 22 20"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3.873.25h14.252V1l.002-.75A3.383 3.383 0 0 1 21.5 3.623v9.004A3.38 3.38 0 0 1 18.127 16H10.52L6.23 19.576A.75.75 0 0 1 5 19v-3H3.873A3.38 3.38 0 0 1 .5 12.627V3.623A3.383 3.383 0 0 1 3.873.25m14.25 1.5H3.877A1.883 1.883 0 0 0 2 3.626v8.998A1.88 1.88 0 0 0 3.876 14.5H5.75a.75.75 0 0 1 .75.75v2.148l3.162-2.636c.203-.17.458-.262.722-.262h7.74A1.883 1.883 0 0 0 20 12.624V3.626a1.88 1.88 0 0 0-1.876-1.876"
        clipRule="evenodd"
      ></path>
    </svg>
  </Icon>
)

export default ChatBotIcon
