export const TRIGGERS = {
  GOAL: {
    DETAILS: 'Details',
    CORE_VALUES: 'Core Values',
    ENABLES_CAREPOINTS: 'Enables Care Points',
    CARED_FOR_BY_CAREPOINTS: 'Cared For By Care Points',
  },
} as const

export type TriggerValues = (typeof TRIGGERS.GOAL)[keyof typeof TRIGGERS.GOAL]

export const EDIT_ROUTES = {
  GOAL: {
    DETAILS: '/details',
    CORE_VALUES: '/core-values',
    ENABLES_CAREPOINTS: '',
    CARED_FOR_BY_CAREPOINTS: '/cared-for-by-carepoints',
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
}

export type EditRoutesType = typeof EDIT_ROUTES
export type GoalRoutesType = typeof EDIT_ROUTES.GOAL

export type RoutesType = GoalRoutesType
