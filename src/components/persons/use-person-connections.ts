'use client'

import { useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client/react'
import { SEARCH_PEOPLE_QUERY } from '@/app/graphql/queries/DASHBOARD_QUERIES'
import {
  CREATE_PERSON_CONNECTION_MUTATION,
  UPDATE_PERSON_CONNECTION_MUTATION,
  DELETE_PERSON_CONNECTION_MUTATION,
} from '@/app/graphql/mutations/PERSON_MUTATIONS'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PersonSelectOption {
  value: string
  label: string
  // GOAL-275: directory search is name-only; connection targets are chosen by
  // name, never email.
  email?: string
}

/**
 * All add / edit / delete state for a person's CONNECTED_TO edges, plus the
 * name-only directory search that backs the target picker.
 *
 * Split out of the person profile page so the page itself stays composition
 * only. `refetch` re-reads the profile after a successful write — the
 * mutations resolve server-side and the connection list lives on
 * `privateProfile`, so there is nothing sensible to write into the cache
 * optimistically.
 */
export function usePersonConnections(opts: {
  personId?: string
  /** Existing connections, used to keep already-connected people out of search. */
  connections?: any[] | null
  refetch: () => Promise<unknown>
}) {
  const { personId, connections, refetch } = opts

  // ── create ────────────────────────────────────────────────────────────────
  const [isAddingConnection, setIsAddingConnection] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedPersonOption, setSelectedPersonOption] =
    useState<PersonSelectOption | null>(null)
  const [connectionWhy, setConnectionWhy] = useState('')
  const [connectionInterests, setConnectionInterests] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [searchPeople, { data: searchData }] =
    useLazyQuery<any>(SEARCH_PEOPLE_QUERY)

  const [createConnection, { loading: creatingConnection }] = useMutation<any>(
    CREATE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        setIsAddingConnection(false)
        setSelectedPersonId('')
        setSelectedPersonOption(null)
        setConnectionWhy('')
        setConnectionInterests('')
        setSearchInput('')
      },
    }
  )

  // ── edit ──────────────────────────────────────────────────────────────────
  const [isEditingConnection, setIsEditingConnection] = useState(false)
  const [editingConnectionId, setEditingConnectionId] = useState<string>('')
  const [editingConnectionWhy, setEditingConnectionWhy] = useState('')
  const [editingConnectionInterests, setEditingConnectionInterests] =
    useState('')

  const [updateConnection, { loading: updatingConnection }] = useMutation<any>(
    UPDATE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        setIsEditingConnection(false)
        setEditingConnectionId('')
        setEditingConnectionWhy('')
        setEditingConnectionInterests('')
      },
    }
  )

  // ── delete ────────────────────────────────────────────────────────────────
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [connectionToDeleteId, setConnectionToDeleteId] = useState<string>('')

  const [deleteConnection, { loading: deletingConnection }] = useMutation<any>(
    DELETE_PERSON_CONNECTION_MUTATION,
    {
      onCompleted: () => {
        setIsConfirmingDelete(false)
        setConnectionToDeleteId('')
      },
    }
  )

  // Derive search results directly — avoids setState-in-effect lint error.
  // Clearing searchInput also clears results since the condition gates on
  // input length.
  const searchResults: any[] =
    searchInput.trim().length >= 2 ? searchData?.people || [] : []

  const handleSearchInput = (value: string) => {
    setSearchInput(value)
    if (value.trim().length >= 2) {
      searchPeople({ variables: { nameContains: value } })
    }
  }

  const personOptions: PersonSelectOption[] = searchResults
    .filter((candidate: any) => candidate.id !== personId)
    .filter(
      (candidate: any) =>
        !connections?.some((connection: any) => connection.id === candidate.id)
    )
    .map((candidate: any) => ({
      value: candidate.id,
      label: candidate.name,
    }))

  const handleCreateConnection = async () => {
    if (!personId || !selectedPersonId || !connectionWhy) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const result = await createConnection({
        variables: {
          fromPersonId: personId,
          toPersonId: selectedPersonId,
          why: connectionWhy,
          interests: connectionInterests,
        },
      })

      if (result.data?.createPersonConnection?.success) {
        await refetch()
      }
    } catch (err) {
      console.error('Error creating connection:', err)
    }
  }

  const handleEditConnection = (
    connectionId: string,
    why: string,
    interests: string
  ) => {
    setEditingConnectionId(connectionId)
    setEditingConnectionWhy(why)
    setEditingConnectionInterests(interests)
    setIsEditingConnection(true)
  }

  const handleUpdateConnection = async () => {
    if (!personId || !editingConnectionId) return

    try {
      const result = await updateConnection({
        variables: {
          fromPersonId: personId,
          toPersonId: editingConnectionId,
          why: editingConnectionWhy,
          interests: editingConnectionInterests,
        },
      })

      if (result.data?.updatePersonConnection?.success) {
        await refetch()
      }
    } catch (err) {
      console.error('Error updating connection:', err)
    }
  }

  const handleConfirmDelete = (connectionId: string) => {
    setConnectionToDeleteId(connectionId)
    setIsConfirmingDelete(true)
  }

  const handleDeleteConnection = async () => {
    if (!personId || !connectionToDeleteId) return

    try {
      const result = await deleteConnection({
        variables: {
          fromPersonId: personId,
          toPersonId: connectionToDeleteId,
        },
      })

      if (result.data?.deletePersonConnection?.success) {
        await refetch()
      }
    } catch (err) {
      console.error('Error deleting connection:', err)
    }
  }

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false)
    setConnectionToDeleteId('')
  }

  return {
    // create
    isAddingConnection,
    setIsAddingConnection,
    selectedPersonOption,
    setSelectedPersonOption,
    selectedPersonId,
    setSelectedPersonId,
    connectionWhy,
    setConnectionWhy,
    connectionInterests,
    setConnectionInterests,
    searchInput,
    setSearchInput,
    personOptions,
    handleSearchInput,
    creatingConnection,
    handleCreateConnection,
    // edit
    isEditingConnection,
    setIsEditingConnection,
    editingConnectionWhy,
    setEditingConnectionWhy,
    editingConnectionInterests,
    setEditingConnectionInterests,
    updatingConnection,
    handleEditConnection,
    handleUpdateConnection,
    // delete
    isConfirmingDelete,
    deletingConnection,
    handleConfirmDelete,
    handleDeleteConnection,
    handleCancelDelete,
  }
}
