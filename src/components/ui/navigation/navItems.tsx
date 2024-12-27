import { ChatBotIcon, GraphIcon, MenuOutline, MemberGuideIcon } from '@/icons'

export const navItems = [
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
    name: 'My Member Guide',
    to: () => '/user-member-guide',
    icon: <MemberGuideIcon />,
  },
  {
    name: 'Graph Visualization',
    to: () => '/graph-visualization',
    icon: <GraphIcon />,
  },
]
