/**
 * Space query resolvers are no longer needed.
 * Authorization is now handled by @authorization directives in the GraphQL schema.
 *
 * MeSpace: Only owner can access (owner_SOME: { id_EQ: "$jwt.user.id" })
 * WeSpace: Owner OR members can access (owner_SOME OR members_SOME)
 *
 * The @neo4j/graphql library automatically enforces these filters.
 */
export const spaceQueryResolvers = {}
