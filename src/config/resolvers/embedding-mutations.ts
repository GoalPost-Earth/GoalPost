import { Context } from '../types'
import { Person } from '@/gql/graphql'
import { generatePersonBio } from '@/utils'

export const embeddingMutations = {
  generatePersonEmbeddings: async (
    _parent: never,
    _args: {
      personId: string
    },
    context: Context
  ) => {
    // TODO: Explore possibility of moving this to a subscription
    const session = context.executionContext.session()
    const { personId } = _args

    try {
      const personRes = await session.run(
        `
            MATCH (person:Person {id: $id})
            RETURN person
            `,
        { id: personId }
      )

      const person = personRes.records[0].get('person').properties as Person
      const bio = generatePersonBio(person)

      await session.run(
        `
            MATCH (person:Person {id: $id})
            WITH person, $bio AS personBio
            WITH person, genai.vector.encode(personBio, 'OpenAI', { token: $token }) AS propertyVector
            CALL db.create.setNodeVectorProperty(person, 'embedding', propertyVector)
            RETURN person.embedding AS embedding
            `,
        { id: personId, bio, token: process.env.OPENAI_API_KEY }
      )

      return true
    } catch (error) {
      console.error(error)
      return false
    } finally {
      await session.close()
    }
  },
}
