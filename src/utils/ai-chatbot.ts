/* eslint-disable @typescript-eslint/no-explicit-any */
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

// tag::extractids[]
export function extractIds(input: any): string[] {
  let output: string[] = []

  // Function to handle an object
  const handleObject = (item: any) => {
    for (const key in item) {
      if (key === '_id') {
        if (!output.includes(item[key])) {
          output.push(item[key])
        }
      } else if (typeof item[key] === 'object' && item[key] !== null) {
        // Recurse into the object if it is not null
        output = output.concat(extractIds(item[key]))
      }
    }
  }

  if (Array.isArray(input)) {
    // If the input is an array, iterate over each element
    input.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        handleObject(item)
      }
    })
  } else if (typeof input === 'object' && input !== null) {
    // If the input is an object, handle it directly
    handleObject(input)
  }

  return output
}
// end::extractids[]
