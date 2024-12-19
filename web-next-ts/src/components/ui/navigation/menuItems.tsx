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
    name: 'AI Chat Bot',
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
  {
    name: 'Forms',
    to: () => '/forms',
    icon: <GraphIcon />,
  }
]
