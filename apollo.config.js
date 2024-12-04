module.exports = {
  client: {
    service: {
      name: 'GoalPost',
      url: 'http://0.0.0.0:4001/graphql',
    },
    includes: ['web-next-ts/src/**/*.ts', 'web-next-ts/src/**/*.tsx'],
    excludes: ['**/__tests__/**'],
  },
}
