import { gql } from '@apollo/client'

export const LOG_PULSE_ACTIVITY = gql`
  mutation LogPulseActivity($input: LogPulseInput!) {
    logPulseActivity(input: $input) {
      success
      message
    }
  }
`

export const LOG_SPACE_ACTIVITY = gql`
  mutation LogSpaceActivity($input: LogSpaceInput!) {
    logSpaceActivity(input: $input) {
      success
      message
    }
  }
`

export const LOG_MEMBER_ACTIVITY = gql`
  mutation LogMemberActivity($input: LogMemberInput!) {
    logMemberActivity(input: $input) {
      success
      message
    }
  }
`

export const LOG_FIELD_ACTIVITY = gql`
  mutation LogFieldActivity($input: LogFieldInput!) {
    logFieldActivity(input: $input) {
      success
      message
    }
  }
`

export const LOG_RESONANCE_ACTIVITY = gql`
  mutation LogResonanceActivity($input: LogResonanceInput!) {
    logResonanceActivity(input: $input) {
      success
      message
    }
  }
`
