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
    page: '/protected/spaces/me-space',
    position: 'center',
  },
  {
    id: 'create-field',
    title: 'Create Your First Field',
    description:
      'Click the button to create a field. You can organize your thoughts around any topic or area of interest.',
    page: '/protected/spaces/me-space',
    position: 'top',
    selector: '[data-tour="create-field-button"]',
  },
  {
    id: 'pulses-intro',
    title: 'Three Types of Pulses',
    description:
      'Create Goal Pulses (aspirations), Resource Pulses (supportive elements), or Story Pulses (narratives) within the field context. Each contributes to discovering patterns.',
    page: '/protected/spaces/me-space',
    position: 'center',
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
