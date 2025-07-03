import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface User {
  id?: number
  email?: string
  firstName?: string
  lastName?: string
  username?: string
  token?: number
  ofUser: {
    id: number
    roles: string[]
    username?: string
    tickets?: Ticket[]
  }
}

export type Ticket = {
  id: number
  startdATE: string
  endate: string
  isactive: boolean
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
}

const defaultValue: UserContextType = {
  user: null,
  setUser: () => {},
}

export const UserContext = createContext<UserContextType>(defaultValue)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
