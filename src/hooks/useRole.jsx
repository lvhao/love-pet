import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { mockUsers } from '../data/mock'
import { mockOperator } from '../data/shop'

const RoleContext = createContext()

const usersByRole = {
  owner: mockUsers.owner,
  caretaker: mockUsers.caretaker,
  operator: mockOperator,
}

export function RoleProvider({ children }) {
  const location = useLocation()
  const [role, setRole] = useState('owner')
  const user = usersByRole[role]

  useEffect(() => {
    const pathRole = location.pathname.split('/')[1]
    if (['owner', 'caretaker', 'operator'].includes(pathRole) && pathRole !== role) {
      setRole(pathRole)
    }
  }, [location.pathname])

  return (
    <RoleContext.Provider value={{ role, setRole, user }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}