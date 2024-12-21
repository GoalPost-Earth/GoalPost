'use client'

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type ChurchOptions = 'council' | 'governorship' | 'stream' | 'campus'

interface ContextChurch {
  id: string
  name: string
  level: ChurchOptions
}
interface AppContextType {
  church: ContextChurch
  setChurch: ({
    id,
    name,
    level,
  }: {
    name: string
    id: string
    level: ChurchOptions
  }) => void
}

const AppContext = createContext<AppContextType>({
  church: {
    id: '',
    name: '',
    level: 'council',
  },
  setChurch: () => null,
})

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [church, setChurch] = useState<ContextChurch>({
    id: '',
    name: '',
    level: 'council',
  })

  useEffect(() => {
    const sessionChurch = JSON.parse(sessionStorage.getItem('church') ?? '{}')
    if (sessionChurch.id && sessionChurch.level) {
      setChurch(sessionChurch)
    }
  }, [])

  const value = useMemo(
    () => ({
      church,
      setChurch: ({
        id,
        name,
        level,
      }: {
        id: string
        name: string
        level: ChurchOptions
      }) => {
        sessionStorage.setItem('church', JSON.stringify({ id, name, level }))
        setChurch({ level, id, name })
      },
    }),
    [church]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
