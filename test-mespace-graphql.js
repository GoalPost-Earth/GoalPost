const fetch = require('node-fetch')

const query = `
  query GetMeSpaceFields($userId: ID!) {
    meSpaces(where: { owner_SOME: { Person: { id_EQ: $userId } } }) {
      id
      name
      contexts {
        id
        title
        emergentName
        createdAt
      }
    }
  }
`

const variables = {
  userId: 'f59c41b9-014b-4ea6-95e8-f633413b1dbb',
}

fetch('http://localhost:3000/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables,
  }),
})
  .then((res) => res.json())
  .then((result) => {
    console.log('GraphQL Response:')
    console.log(JSON.stringify(result, null, 2))
  })
  .catch((err) => {
    console.error('Error:', err)
  })
