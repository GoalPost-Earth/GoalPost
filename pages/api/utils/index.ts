import { Person } from '@/gql/graphql'
export const generatePersonBio = (person: Person) => {
  const pronouns = person.pronouns
    ? `prefers the pronouns ${person.pronouns}.`
    : ''
  const phone = person.phone
    ? `${person.firstName}'s phone number is ${person.phone}.`
    : ''
  const location = person.location
    ? `${person.firstName} lives in ${person.location}.`
    : ''

  const favorites = person.favorites
    ? `${person.firstName} enjoys ${person.favorites}.`
    : ''
  const passions = person.passions
    ? `${person.firstName} is passionate about ${person.passions}.`
    : ''
  const traits = person.traits
    ? `${person.firstName} is known for being ${person.traits}.`
    : ''
  const fieldsOfCare = person.fieldsOfCare
    ? `${person.firstName} cares about ${person.fieldsOfCare}.`
    : ''
  const interests = person.interests
    ? `${person.firstName} is interested in ${person.interests}.`
    : ''

  return `${person.firstName} ${person.lastName} ${pronouns} ${phone} ${person.firstName}'s email is ${person.email}. ${location} ${favorites} ${passions} ${traits} ${fieldsOfCare} ${interests}`.trim()
}
