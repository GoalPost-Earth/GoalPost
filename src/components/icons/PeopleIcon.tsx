import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const PeopleIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="18"
      fill="none"
      viewBox="0 0 24 18"
    >
      <path
        fill="currentColor"
        d="M8.4 11.1c-2.808 0-8.4 1.404-8.4 4.2v2.1h16.8v-2.1c0-2.796-5.592-4.2-8.4-4.2M2.808 15c1.008-.696 3.444-1.5 5.592-1.5s4.584.804 5.592 1.5zM8.4 9c2.316 0 4.2-1.884 4.2-4.2S10.716.6 8.4.6a4.205 4.205 0 0 0-4.2 4.2C4.2 7.116 6.084 9 8.4 9m0-6c.996 0 1.8.804 1.8 1.8s-.804 1.8-1.8 1.8-1.8-.804-1.8-1.8S7.404 3 8.4 3m8.448 8.172C18.24 12.18 19.2 13.524 19.2 15.3v2.1H24v-2.1c0-2.424-4.2-3.804-7.152-4.128M15.6 9c2.316 0 4.2-1.884 4.2-4.2S17.916.6 15.6.6c-.648 0-1.248.156-1.8.42A6.53 6.53 0 0 1 15 4.8a6.53 6.53 0 0 1-1.2 3.78c.552.264 1.152.42 1.8.42"
      ></path>
    </svg>
  </Icon>
)

export default PeopleIcon
