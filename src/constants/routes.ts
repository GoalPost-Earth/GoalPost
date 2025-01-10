export const TRIGGERS = {
  GOAL: {
    DETAILS: 'Goal Details',
    CORE_VALUES: 'Core Values',
    ENABLES_CAREPOINTS: 'Enables Care Points',
    CARED_FOR_BY_CAREPOINTS: 'Cared For By Care Points',
  },
  CAREPOINTS: {
    DETAILS: 'Care Point Details',
    LINKED_GOALS: 'Enabling Goals',
  },
} as const

// Define a type that includes all the values under GOAL and CAREPOINTS
export type TriggerValues =
  | (typeof TRIGGERS.GOAL)[keyof typeof TRIGGERS.GOAL]
  | (typeof TRIGGERS.CAREPOINTS)[keyof typeof TRIGGERS.CAREPOINTS]

export const EDIT_ROUTES = {
  GOAL: {
    DETAILS: '/details',
    CORE_VALUES: '',
    ENABLES_CAREPOINTS: '',
    CARED_FOR_BY_CAREPOINTS: '/cared-for-by-carepoints',
  },
  CAREPOINTS: {
    DETAILS: '/details',
    LINKED_GOALS: '',
  },
} as const

export type EditRouteValues =
  (typeof EDIT_ROUTES.GOAL)[keyof typeof EDIT_ROUTES.GOAL]

export const TRIGGER_TO_ROUTE_MAP = {
  [TRIGGERS.GOAL.DETAILS]: EDIT_ROUTES.GOAL.DETAILS,
  [TRIGGERS.GOAL.CORE_VALUES]: EDIT_ROUTES.GOAL.CORE_VALUES,
  [TRIGGERS.GOAL.ENABLES_CAREPOINTS]: EDIT_ROUTES.GOAL.ENABLES_CAREPOINTS,
  [TRIGGERS.GOAL.CARED_FOR_BY_CAREPOINTS]:
    EDIT_ROUTES.GOAL.CARED_FOR_BY_CAREPOINTS,

  [TRIGGERS.CAREPOINTS.DETAILS]: EDIT_ROUTES.CAREPOINTS.DETAILS,
  [TRIGGERS.CAREPOINTS.LINKED_GOALS]: EDIT_ROUTES.CAREPOINTS.LINKED_GOALS,
}

export type EditRoutesType = typeof EDIT_ROUTES
export type GoalRoutesType = typeof EDIT_ROUTES.GOAL
export type CarePointRoutesType = typeof EDIT_ROUTES.CAREPOINTS

export type RoutesType = GoalRoutesType
