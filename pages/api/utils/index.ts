import { Person } from '@/gql/graphql'

export const generatePersonBio = (person: Person) => {
  return `${person.firstName} ${person.lastName} prefers the pronouns ${person.pronouns}. ${person.firstName} phone number is ${person.phone} and email is ${person.email}. ${person.firstName} lives in ${person.location}.`
}
