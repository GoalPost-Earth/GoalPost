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
    id: 'create-field',
    title: 'Create Your First Field',
    description:
      'Click the button to create a field. You can organize your thoughts around any topic or area of interest.',
    page: '/protected/spaces/me-space/[id]',
    position: 'top',
    selector: '[data-tour="create-field-button"]',
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
    id: 'complete',
    title: "You're All Set!",
    description:
      'You now understand the basics. Feel free to explore, create fields and pulses, and discover resonances with others. Welcome to GoalPost!',
    page: '/protected/dashboard',
    position: 'center',
    actionLabel: 'Start Exploring',
  },
]
