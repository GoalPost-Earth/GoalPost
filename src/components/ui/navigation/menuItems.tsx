import {
  ChatBotIcon,
  DiscoverIcon,
  GraphIcon,
  MenuOutline,
  ProfileIcon,
} from '@/icons'

export const menuItems = [
  {
    name: 'Home Page',
    to: () => '/',
    icon: <MenuOutline />,
  },
  {
    name: 'AI Chat Bot',
    to: () => '/chatbot',
    icon: <ChatBotIcon />,
  },
  {
    name: 'Profile',
    to: () => '/profile',
    icon: <ProfileIcon />,
  },
  {
    name: 'Graph Visualization',
    to: () => '/graph-visualization',
    icon: <GraphIcon />,
  },
]
