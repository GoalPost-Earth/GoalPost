import { Icon, IconProps } from '@chakra-ui/react'

const HomeIcon = ({ color = 'brandIcons', ...rest }: IconProps) => (
  <Icon color={color} width="24px" height="22px" {...rest}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 22">
      <path
        fill="currentColor"
        d="m12 4.028 6 5.4V18.8h-2.4v-7.2H8.4v7.2H6V9.428zM12 .8 0 11.6h3.6v9.6h7.2V14h2.4v7.2h7.2v-9.6H24z"
      ></path>
    </svg>
  </Icon>
)

export default HomeIcon
