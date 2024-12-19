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
    name: 'Discover',
    to: () => '/#',
    icon: <DiscoverIcon />,
  },
  {
    name: 'AI Chat Box',
    to: () => '/#',
    icon: <ChatBotIcon />,
  },
  {
    name: 'Profile',
    to: () => '/#',
    icon: <ProfileIcon />,
  },
  {
    name: 'Graph Visualization',
    to: () => '/#',
    icon: <GraphIcon />,
  },
]
