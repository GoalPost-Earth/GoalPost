import { OnboardingStep } from '@/contexts/OnboardingContext'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to GoalPost',
    description:
      "GoalPost is a community platform for discovering patterns across people's aspirations, resources, and stories. Let's explore how it works.",
    page: '/protected/spaces',
    position: 'bottom',
    selector: '[data-tour="spaces-container"]',
  },
  {
    id: 'spaces-intro',
    title: 'Understanding Spaces',
    description:
      "MeSpace is your personal sanctuary for self-reflection and growth. WeSpace is for community collaboration. Let's start with your MeSpace.",
    page: '/protected/spaces',
    position: 'right',
    selector: '[data-tour="me-space-button"]',
  },
  {
    id: 'fields-intro',
    title: 'What are Fields?',
    description:
      'Fields organize your ideas and contributions. Think of them as buckets that hold related pulses (messages) on specific topics.',
    page: '/protected/spaces/me-space/[id]',
    position: 'center',
  },
  {
    id: 'pulses-intro',
    title: 'Three Types of Pulses',
    description:
      'Create Goal Pulses (aspirations), Resource Pulses (supportive elements), or Story Pulses (narratives) within the field context. Each contributes to discovering patterns.',
    page: '/protected/spaces/me-space/[id]',
    position: 'center',
  },
  {
    id: 'we-spaces-intro',
    title: 'Understanding WeSpaces',
    description:
      'WeSpaces are collaborative spaces where you can work with your community. Explore existing WeSpaces where you are a member, owner, or admin.',
    page: '/protected/spaces/we-space',
    position: 'center',
  },
  {
    id: 'we-space-fields',
    title: 'WeSpace Fields',
    description:
      'Just like MeSpace, WeSpaces have fields for organizing collaborative content and contexts. Create and share fields with your community.',
    page: '/protected/spaces/we-space',
    position: 'center',
  },
  {
    id: 'create-wespace',
    title: 'Create Your Own WeSpace',
    description:
      'Ready to collaborate? Click here to create your own WeSpace and invite your community to join.',
    page: '/protected/spaces/we-space',
    position: 'top',
    selector: '[data-tour="create-wespace-button"]',
  },
  {
    id: 'dashboard-intro',
    title: 'Your Dashboard',
    description:
      "Here you can see your recent activity, fields, spaces, and the people you're connected with. Everything in one place.",
    page: '/protected/dashboard',
    position: 'left',
    selector: '[data-tour="dashboard-overview"]',
  },
  {
    id: 'settings-access',
    title: 'Access Your Settings',
    description:
      'Click on your avatar in the top right corner to access your user menu, where you can adjust your preferences and personalize your experience.',
    page: '/protected/dashboard',
    position: 'top',
    selector: 'button[aria-label="User menu"]',
  },
  {
    id: 'settings-appearance',
    title: 'Appearance Settings',
    description:
      'Customize your theme color to match your essence. Choose from default, warm, forest, purple, or emerald colors to personalize your atmosphere.',
    page: '/protected/settings',
    position: 'bottom',
    selector: '[data-tour="settings-appearance"]',
  },
  {
    id: 'settings-animations',
    title: 'Enable Animations',
    description:
      'Toggle fluid UI transitions and field drifts on or off. Animations add fluidity to your interactions while you can disable them for a more static experience.',
    page: '/protected/settings',
    position: 'bottom',
    selector: '[data-tour="settings-animations"]',
  },
  {
    id: 'settings-ai-mode',
    title: 'Choose Your AI Assistant Mode',
    description:
      'Select how you want to interact with the AI: Aiden (conversational), ReAct (structured thinking), or Disabled (no AI assistance). Each mode offers different interaction styles.',
    page: '/protected/settings',
    position: 'bottom',
    selector: '[data-tour="settings-ai-mode"]',
  },
  {
    id: 'settings-resonance',
    title: 'Resonance Linkage',
    description:
      'Enable this to see patterns and connections within your fields. This AI-powered feature discovers semantic relationships across your pulses and shows you related insights.',
    page: '/protected/settings',
    position: 'bottom',
    selector: '[data-tour="settings-resonance"]',
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description:
      'You now understand the basics. Feel free to explore, create fields and pulses, and discover resonances with others. Welcome to GoalPost!',
    page: '/protected/spaces',
    position: 'center',
    actionLabel: 'Start Exploring',
  },
]
