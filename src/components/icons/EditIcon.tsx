import * as React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

const EditIcon = ({ color = '', ...rest }: IconProps) => (
  <Icon color={color} width="15px" height="15px" {...rest}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="16"
      fill="none"
      viewBox="0 0 17 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        d="M7.71 2.081H2.49A1.49 1.49 0 0 0 1 3.572V14.01A1.49 1.49 0 0 0 2.491 15.5h10.437a1.49 1.49 0 0 0 1.49-1.491V8.791M13.3.963A1.581 1.581 0 0 1 15.537 3.2l-7.082 7.082-2.982.745.745-2.982z"
      ></path>
    </svg>
  </Icon>
)

export default EditIcon
